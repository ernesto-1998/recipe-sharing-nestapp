import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect } from 'amqp-connection-manager';
import { RabbitMQService } from './rabbitmq.service';

jest.mock('amqp-connection-manager', () => ({
  connect: jest.fn(),
}));

describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let configService: jest.Mocked<ConfigService>;
  let mockConnection: {
    on: jest.Mock;
    createChannel: jest.Mock;
    close: jest.Mock;
    isConnected: jest.Mock;
  };
  let mockPublisherChannel: {
    publish: jest.Mock;
    close: jest.Mock;
    on: jest.Mock;
  };

  const mockConnect = connect as unknown as jest.Mock;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    mockPublisherChannel = {
      publish: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };

    mockConnection = {
      on: jest.fn(),
      createChannel: jest.fn().mockReturnValue(mockPublisherChannel),
      close: jest.fn().mockResolvedValue(undefined),
      isConnected: jest.fn().mockReturnValue(true),
    };

    mockConnect.mockReturnValue(mockConnection);

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const config: Record<string, string> = {
          RABBITMQ_HOST: 'localhost',
          RABBITMQ_PORT: '5672',
          RABBITMQ_USER: 'guest',
          RABBITMQ_PASSWORD: 'guest',
          RABBITMQ_PROTOCOL: 'amqp',
          RABBITMQ_VHOST: '/',
        };
        return config[key] ?? defaultValue;
      }),
    };

    const module = await Test.createTestingModule({
      providers: [
        RabbitMQService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get(RabbitMQService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect with the correct URL and set up event listeners', () => {
      const expectedUrl = 'amqp://guest:guest@localhost:5672';

      service.onModuleInit();

      expect(configService.get).toHaveBeenCalledWith(
        'RABBITMQ_HOST',
        'localhost',
      );
      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_PORT', '5672');
      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_USER', 'guest');
      expect(configService.get).toHaveBeenCalledWith(
        'RABBITMQ_PASSWORD',
        'guest',
      );
      expect(configService.get).toHaveBeenCalledWith(
        'RABBITMQ_PROTOCOL',
        'amqp',
      );
      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_VHOST', '/');

      expect(mockConnect).toHaveBeenCalledWith([expectedUrl], {
        reconnectTimeInSeconds: 5,
        heartbeatIntervalInSeconds: 10,
      });

      expect(mockConnection.on).toHaveBeenCalledWith(
        'connect',
        expect.any(Function),
      );
      expect(mockConnection.on).toHaveBeenCalledWith(
        'disconnect',
        expect.any(Function),
      );
      expect(mockConnection.on).toHaveBeenCalledWith(
        'connectFailed',
        expect.any(Function),
      );
      expect(mockConnection.createChannel).toHaveBeenCalledWith({ json: true });
    });

    it('should only warn on connectFailed without rejecting', () => {
      service.onModuleInit();

      const connectFailedHandler = mockConnection.on.mock.calls.find(
        (call) => call[0] === 'connectFailed',
      )[1];

      expect(() =>
        connectFailedHandler({ err: new Error('refused') }),
      ).not.toThrow();
    });
  });

  describe('connected', () => {
    it('should return true when connection is established', () => {
      mockConnection.isConnected.mockReturnValue(true);
      service.onModuleInit();

      expect(service.connected).toBe(true);
    });

    it('should return false when connection is not established', () => {
      mockConnection.isConnected.mockReturnValue(false);
      service.onModuleInit();

      expect(service.connected).toBe(false);
    });
  });

  describe('onModuleDestroy', () => {
    it('should close channel and connection gracefully', async () => {
      service.onModuleInit();

      await service.onModuleDestroy();

      expect(mockPublisherChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle errors during graceful shutdown', async () => {
      mockPublisherChannel.close.mockRejectedValue(new Error('Close failed'));

      service.onModuleInit();

      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });

  describe('publish', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should publish message via publisherChannel', async () => {
      await service.publish('test.exchange', 'test.routing', { test: 'data' });

      expect(mockPublisherChannel.publish).toHaveBeenCalledWith(
        'test.exchange',
        'test.routing',
        { test: 'data' },
        { persistent: true },
      );
    });

    it('should merge default options with provided options', async () => {
      await service.publish(
        'ex',
        'rk',
        { data: 'test' },
        { expiration: '1000' },
      );

      expect(mockPublisherChannel.publish).toHaveBeenCalledWith(
        'ex',
        'rk',
        { data: 'test' },
        { persistent: true, expiration: '1000' },
      );
    });

    it('should throw when message is not confirmed by broker', async () => {
      mockPublisherChannel.publish.mockResolvedValue(false);

      await expect(
        service.publish('ex', 'rk', { data: 'test' }),
      ).rejects.toThrow('Message was not confirmed by RabbitMQ broker');
    });

    it('should throw when publish times out', async () => {
      jest.useFakeTimers();

      mockPublisherChannel.publish.mockReturnValue(
        new Promise<never>(() => {}),
      );

      const publishPromise = service.publish('ex', 'rk', { data: 'test' });

      jest.runAllTimers();
      await Promise.resolve();

      await expect(publishPromise).rejects.toThrow(
        'RabbitMQ publish timeout exceeded',
      );

      jest.useRealTimers();
    });
  });

  describe('createConsumerChannel', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should create a consumer channel with the provided setup function', () => {
      const setup = jest.fn();

      const consumerChannel = service.createConsumerChannel(setup);

      expect(mockConnection.createChannel).toHaveBeenCalledWith({
        json: true,
        setup,
      });
      expect(consumerChannel).toBe(mockPublisherChannel);
    });

    it('should return the channel created by the connection', () => {
      const customChannel = { on: jest.fn(), close: jest.fn() };
      mockConnection.createChannel.mockReturnValue(customChannel);

      const result = service.createConsumerChannel(jest.fn());

      expect(result).toBe(customChannel);
    });
  });
});

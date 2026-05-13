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
  let mockChannelWrapper: {
    publish: jest.Mock;
    close: jest.Mock;
    on: jest.Mock;
  };

  const mockConnect = connect as unknown as jest.Mock;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    mockChannelWrapper = {
      publish: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };

    mockConnection = {
      on: jest.fn(),
      createChannel: jest.fn().mockImplementation(
        (opts?: { json?: boolean; setup?: Function }) => {
          if (opts?.setup) {
            return { on: jest.fn() };
          }
          return mockChannelWrapper;
        },
      ),
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

      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_HOST', 'localhost');
      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_PORT', '5672');
      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_USER', 'guest');
      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_PASSWORD', 'guest');
      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_PROTOCOL', 'amqp');
      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_VHOST', '/');

      expect(mockConnect).toHaveBeenCalledWith([expectedUrl], {
        reconnectTimeInSeconds: 5,
        heartbeatIntervalInSeconds: 10,
      });

      expect(mockConnection.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockConnection.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockConnection.on).toHaveBeenCalledWith('connectFailed', expect.any(Function));
      expect(mockConnection.createChannel).toHaveBeenCalledWith({ json: true });
    });

    it('should resolve channelReady when connect event fires', () => {
      service.onModuleInit();

      const connectHandler = mockConnection.on.mock.calls.find(
        (call) => call[0] === 'connect',
      )[1];
      connectHandler();

      expect(service.connected).toBe(true);
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

    it('should return false when connection is null', () => {
      expect(service.connected).toBe(false);
    });
  });

  describe('onModuleDestroy', () => {
    it('should close channel and connection gracefully', async () => {
      service.onModuleInit();

      await service.onModuleDestroy();

      expect(mockChannelWrapper.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle errors during graceful shutdown', async () => {
      mockChannelWrapper.close.mockRejectedValue(new Error('Close failed'));

      service.onModuleInit();

      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });

    it('should not throw when channelWrapper is null', async () => {
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });

  describe('publish', () => {
    function initServiceWithConnect(): void {
      service.onModuleInit();
      const connectHandler = mockConnection.on.mock.calls.find(
        (call) => call[0] === 'connect',
      )[1];
      connectHandler();
    }

    it('should publish message via channelWrapper', async () => {
      initServiceWithConnect();

      await service.publish('test.exchange', 'test.routing', { test: 'data' });

      expect(mockChannelWrapper.publish).toHaveBeenCalledWith(
        'test.exchange',
        'test.routing',
        { test: 'data' },
        { persistent: true },
      );
    });

    it('should merge default options with provided options', async () => {
      initServiceWithConnect();

      await service.publish('ex', 'rk', { data: 'test' }, { expiration: '1000' });

      expect(mockChannelWrapper.publish).toHaveBeenCalledWith(
        'ex',
        'rk',
        { data: 'test' },
        { persistent: true, expiration: '1000' },
      );
    });

    it('should throw when channel is not available', async () => {
      (service as any).resolveChannelReady();
      (service as any).channelWrapper = null;

      await expect(
        service.publish('ex', 'rk', { data: 'test' }),
      ).rejects.toThrow('RabbitMQ channel is not available');
    });

    it('should throw when message is not confirmed by broker', async () => {
      mockChannelWrapper.publish.mockResolvedValue(false);
      initServiceWithConnect();

      await expect(
        service.publish('ex', 'rk', { data: 'test' }),
      ).rejects.toThrow('Message was not confirmed by RabbitMQ broker');
    });

    it('should wait for channelReady before publishing', async () => {
      service.onModuleInit();

      const publishPromise = service.publish('ex', 'rk', { data: 'test' });

      expect(mockChannelWrapper.publish).not.toHaveBeenCalled();

      const connectHandler = mockConnection.on.mock.calls.find(
        (call) => call[0] === 'connect',
      )[1];
      connectHandler();

      await publishPromise;

      expect(mockChannelWrapper.publish).toHaveBeenCalled();
    });
  });

  describe('createConsumerChannel', () => {
    function initServiceWithConnect(): void {
      service.onModuleInit();
      const connectHandler = mockConnection.on.mock.calls.find(
        (call) => call[0] === 'connect',
      )[1];
      connectHandler();
    }

    it('should create a consumer channel with setup function', async () => {
      const setup = jest.fn().mockResolvedValue(undefined);

      mockConnection.createChannel = jest.fn().mockImplementation(
        (opts?: { json?: boolean; setup?: Function }) => {
          if (opts?.setup) {
            opts.setup({});
          }
          return { on: jest.fn() };
        },
      );

      initServiceWithConnect();

      await service.createConsumerChannel(setup);

      expect(mockConnection.createChannel).toHaveBeenCalledWith({
        json: true,
        setup: expect.any(Function),
      });
      expect(setup).toHaveBeenCalled();
    });

    it('should register error handler on consumer channel', async () => {
      const setup = jest.fn().mockResolvedValue(undefined);
      const mockConsumerChannel = { on: jest.fn() };

      mockConnection.createChannel = jest.fn().mockImplementation(
        (opts?: { json?: boolean; setup?: Function }) => {
          if (opts?.setup) {
            opts.setup({});
          }
          return mockConsumerChannel;
        },
      );

      initServiceWithConnect();

      await service.createConsumerChannel(setup);

      expect(mockConsumerChannel.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function),
      );
    });

    it('should throw when connection is not initialized', async () => {
      (service as any).resolveChannelReady();
      (service as any).connection = null;

      await expect(
        service.createConsumerChannel(jest.fn()),
      ).rejects.toThrow('RabbitMQ connection is not initialized');
    });

    it('should reject promise when setup function throws', async () => {
      const setup = jest.fn().mockRejectedValue(new Error('Setup failed'));

      mockConnection.createChannel = jest.fn().mockImplementation(
        (opts?: { json?: boolean; setup?: Function }) => {
          if (opts?.setup) {
            opts.setup({});
          }
          return { on: jest.fn() };
        },
      );

      initServiceWithConnect();

      await expect(service.createConsumerChannel(setup)).rejects.toThrow(
        'Setup failed',
      );
    });

    it('should reject with Error when setup throws a non-Error value', async () => {
      const setup = jest.fn().mockRejectedValue('string error');

      mockConnection.createChannel = jest.fn().mockImplementation(
        (opts?: { json?: boolean; setup?: Function }) => {
          if (opts?.setup) {
            opts.setup({});
          }
          return { on: jest.fn() };
        },
      );

      initServiceWithConnect();

      await expect(service.createConsumerChannel(setup)).rejects.toThrow(
        'string error',
      );
    });
  });
});
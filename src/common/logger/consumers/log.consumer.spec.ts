import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { LogConsumer } from './log.consumer';
import { RabbitMQService } from 'src/common/rabbitmq/services/rabbitmq.service';
import { PostgresLogRepository } from '../persistence/postgres-log.repository';
import {
  LOG_EXCHANGE,
  LOG_QUEUE,
  LOG_ROUTING_KEY,
} from '../constants/logger.constants';
import { RabbitMQExchangeType } from 'src/common/rabbitmq/enums/rabbitmq-exchange-type.enum';
import type { ILogMessage } from '../interfaces/log-message.interface';

describe('LogConsumer', () => {
  let logConsumer: LogConsumer;
  let rabbitMQService: jest.Mocked<RabbitMQService>;
  let postgresLogRepository: jest.Mocked<PostgresLogRepository>;
  let mockChannel: {
    prefetch: jest.Mock;
    assertExchange: jest.Mock;
    assertQueue: jest.Mock;
    bindQueue: jest.Mock;
    consume: jest.Mock;
    ack: jest.Mock;
    nack: jest.Mock;
  };

  let capturedConsumeCallback: ((msg: unknown) => void) | null;

  const mockLogMessage: ILogMessage = {
    level: 'log',
    message: 'test log',
    context: 'TestContext',
    statusCode: 200,
    trace: null,
    createdAt: new Date().toISOString(),
    request: {
      ipAddress: '127.0.0.1',
      host: 'localhost',
      fullUrl: 'http://localhost/test',
      path: '/test',
      httpMethod: 'GET',
      protocol: 'http',
      userId: 'user123',
    },
  };

  function setupConsumerChannel(
    setup: (ch: typeof mockChannel) => Promise<void>,
  ): void {
    setup(mockChannel);
  }

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    capturedConsumeCallback = null;

    mockChannel = {
      prefetch: jest.fn().mockResolvedValue(undefined),
      assertExchange: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest.fn().mockResolvedValue(undefined),
      bindQueue: jest.fn().mockResolvedValue(undefined),
      consume: jest
        .fn()
        .mockImplementation(
          (_queue: string, callback: (msg: unknown) => void) => {
            capturedConsumeCallback = callback;
          },
        ),
      ack: jest.fn(),
      nack: jest.fn(),
    };

    const mockRabbitMQService = {
      createConsumerChannel: jest.fn().mockImplementation(setupConsumerChannel),
    };

    const mockPostgresLogRepository = {
      insert: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        LogConsumer,
        { provide: RabbitMQService, useValue: mockRabbitMQService },
        { provide: PostgresLogRepository, useValue: mockPostgresLogRepository },
      ],
    }).compile();

    logConsumer = module.get(LogConsumer);
    rabbitMQService = module.get(RabbitMQService);
    postgresLogRepository = module.get(PostgresLogRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('onModuleInit', () => {
    it('should pass the exchange/queue/binding setup to createConsumerChannel', async () => {
      await logConsumer.onModuleInit();

      expect(rabbitMQService.createConsumerChannel).toHaveBeenCalledTimes(1);
      expect(rabbitMQService.createConsumerChannel).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should set up prefetch, exchange, queue, binding and consume inside the setup callback', async () => {
      await logConsumer.onModuleInit();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockChannel.prefetch).toHaveBeenCalledWith(10);
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        LOG_EXCHANGE,
        RabbitMQExchangeType.DIRECT,
        { durable: true },
      );
      expect(mockChannel.assertQueue).toHaveBeenCalledWith(LOG_QUEUE, {
        durable: true,
      });
      expect(mockChannel.bindQueue).toHaveBeenCalledWith(
        LOG_QUEUE,
        LOG_EXCHANGE,
        LOG_ROUTING_KEY,
      );
      expect(mockChannel.consume).toHaveBeenCalledWith(
        LOG_QUEUE,
        expect.any(Function),
        { noAck: false },
      );
    });

    it('should catch and log errors when initialization fails', async () => {
      rabbitMQService.createConsumerChannel.mockImplementation(() => {
        throw new Error('Channel setup failed');
      });

      await expect(logConsumer.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('processMessage (via consume callback)', () => {
    beforeEach(async () => {
      await logConsumer.onModuleInit();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    it('should insert parsed message into postgres and ack on success', async () => {
      const buffer = Buffer.from(JSON.stringify(mockLogMessage));
      const msg = { content: buffer };

      capturedConsumeCallback!(msg);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(postgresLogRepository.insert).toHaveBeenCalledWith(mockLogMessage);
      expect(mockChannel.ack).toHaveBeenCalledWith(msg);
      expect(mockChannel.nack).not.toHaveBeenCalled();
    });

    it('should nack the message when processing fails', async () => {
      postgresLogRepository.insert.mockRejectedValue(new Error('DB error'));

      const buffer = Buffer.from(JSON.stringify(mockLogMessage));
      const msg = { content: buffer };

      capturedConsumeCallback!(msg);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(postgresLogRepository.insert).toHaveBeenCalledWith(mockLogMessage);
      expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, false);
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('should handle nack failure gracefully', async () => {
      postgresLogRepository.insert.mockRejectedValue(new Error('DB error'));
      mockChannel.nack.mockImplementation(() => {
        throw new Error('Nack failed');
      });

      const buffer = Buffer.from(JSON.stringify(mockLogMessage));
      const msg = { content: buffer };

      capturedConsumeCallback!(msg);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(postgresLogRepository.insert).toHaveBeenCalled();
      expect(mockChannel.nack).toHaveBeenCalled();
    });

    it('should not process null messages', async () => {
      capturedConsumeCallback!(null);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(postgresLogRepository.insert).not.toHaveBeenCalled();
      expect(mockChannel.ack).not.toHaveBeenCalled();
      expect(mockChannel.nack).not.toHaveBeenCalled();
    });

    it('should ack the specific message that was processed', async () => {
      const buffer = Buffer.from(JSON.stringify(mockLogMessage));
      const msg1 = { content: buffer, id: 'msg1' };
      const msg2 = { content: buffer, id: 'msg2' };

      capturedConsumeCallback!(msg1);
      capturedConsumeCallback!(msg2);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockChannel.ack).toHaveBeenCalledWith(msg1);
      expect(mockChannel.ack).toHaveBeenCalledWith(msg2);
      expect(postgresLogRepository.insert).toHaveBeenCalledTimes(2);
    });
  });
});

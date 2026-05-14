import { Test } from '@nestjs/testing';
import { LoggerService } from './logger.service';
import { RabbitMQService } from 'src/common/rabbitmq/services/rabbitmq.service';
import { RequestContextService } from 'src/common/context/request-context.service';
import { LOG_EXCHANGE, LOG_ROUTING_KEY } from '../constants/logger.constants';

describe('LoggerService', () => {
  let loggerService: LoggerService;
  let rabbitmqService: jest.Mocked<RabbitMQService>;
  let requestCtx: jest.Mocked<RequestContextService>;

  beforeEach(async () => {
    const mockRabbitMQService = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const mockRequestContextService = {
      getContext: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        LoggerService,
        { provide: RabbitMQService, useValue: mockRabbitMQService },
        { provide: RequestContextService, useValue: mockRequestContextService },
      ],
    }).compile();

    loggerService = module.get(LoggerService);
    rabbitmqService = module.get(RabbitMQService);
    requestCtx = module.get(RequestContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('log', () => {
    it('should publish a LOG level message', async () => {
      loggerService.log('test message', 'TestContext', 200);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(rabbitmqService.publish).toHaveBeenCalledWith(
        LOG_EXCHANGE,
        LOG_ROUTING_KEY,
        expect.objectContaining({
          level: 'log',
          message: 'test message',
          context: 'TestContext',
          statusCode: 200,
        }),
      );
    });

    it('should pass null context when not provided', async () => {
      loggerService.log('test');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(rabbitmqService.publish).toHaveBeenCalledWith(
        LOG_EXCHANGE,
        LOG_ROUTING_KEY,
        expect.objectContaining({
          context: null,
          statusCode: null,
          trace: null,
        }),
      );
    });
  });

  describe('error', () => {
    it('should publish an ERROR level message with trace', async () => {
      loggerService.error('error message', 'ErrorCtx', 500, 'stack trace');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(rabbitmqService.publish).toHaveBeenCalledWith(
        LOG_EXCHANGE,
        LOG_ROUTING_KEY,
        expect.objectContaining({
          level: 'error',
          message: 'error message',
          context: 'ErrorCtx',
          statusCode: 500,
          trace: 'stack trace',
        }),
      );
    });
  });

  describe('warn', () => {
    it('should publish a WARN level message', async () => {
      loggerService.warn('warn message', 'WarnCtx', 400);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(rabbitmqService.publish).toHaveBeenCalledWith(
        LOG_EXCHANGE,
        LOG_ROUTING_KEY,
        expect.objectContaining({
          level: 'warn',
          message: 'warn message',
          context: 'WarnCtx',
          statusCode: 400,
        }),
      );
    });
  });

  describe('debug', () => {
    it('should publish a DEBUG level message', async () => {
      loggerService.debug('debug message', 'DebugCtx');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(rabbitmqService.publish).toHaveBeenCalledWith(
        LOG_EXCHANGE,
        LOG_ROUTING_KEY,
        expect.objectContaining({
          level: 'debug',
          message: 'debug message',
          context: 'DebugCtx',
        }),
      );
    });
  });

  describe('verbose', () => {
    it('should publish a VERBOSE level message', async () => {
      loggerService.verbose('verbose message');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(rabbitmqService.publish).toHaveBeenCalledWith(
        LOG_EXCHANGE,
        LOG_ROUTING_KEY,
        expect.objectContaining({
          level: 'verbose',
          message: 'verbose message',
        }),
      );
    });
  });

  describe('publish (request context)', () => {
    it('should include request context in the published payload', async () => {
      requestCtx.getContext.mockReturnValue({
        ip_address: '192.168.1.1',
        host: 'localhost:5000',
        full_url: 'http://localhost:5000/test',
        path: '/test',
        http_method: 'GET',
        protocol: 'http',
        user_id: 'user123',
      });

      loggerService.log('ctx message');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(rabbitmqService.publish).toHaveBeenCalledWith(
        LOG_EXCHANGE,
        LOG_ROUTING_KEY,
        expect.objectContaining({
          request: {
            ipAddress: '192.168.1.1',
            host: 'localhost:5000',
            fullUrl: 'http://localhost:5000/test',
            path: '/test',
            httpMethod: 'GET',
            protocol: 'http',
            userId: 'user123',
          },
        }),
      );
    });

    it('should use null values when request context is not available', async () => {
      requestCtx.getContext.mockReturnValue(undefined);

      loggerService.log('no ctx');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(rabbitmqService.publish).toHaveBeenCalledWith(
        LOG_EXCHANGE,
        LOG_ROUTING_KEY,
        expect.objectContaining({
          request: {
            ipAddress: null,
            host: null,
            fullUrl: null,
            path: null,
            httpMethod: null,
            protocol: null,
            userId: null,
          },
        }),
      );
    });

    it('should stringify non-string messages', async () => {
      const obj = { foo: 'bar' };
      loggerService.log(obj);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(rabbitmqService.publish).toHaveBeenCalledWith(
        LOG_EXCHANGE,
        LOG_ROUTING_KEY,
        expect.objectContaining({ message: JSON.stringify(obj) }),
      );
    });

    it('should include createdAt as ISO string', async () => {
      loggerService.log('timing');
      await new Promise((resolve) => setTimeout(resolve, 0));

      const callArg = (rabbitmqService.publish as jest.Mock).mock.calls[0][2];
      expect(callArg.createdAt).toBeDefined();
      expect(typeof callArg.createdAt).toBe('string');
      expect(new Date(callArg.createdAt).toISOString()).toBe(callArg.createdAt);
    });
  });

  describe('fallback on publish failure', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should fallback to stdout when publish rejects', async () => {
      rabbitmqService.publish.mockRejectedValue(new Error('Broker error'));

      loggerService.log('fallback test');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to publish log to RabbitMQ, falling back to stdout:',
        'Broker error',
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(String));
    });

    it('should fallback to stdout when publish times out', async () => {
      rabbitmqService.publish.mockRejectedValue(
        new Error('RabbitMQ not available after timeout'),
      );

      loggerService.log('timeout test');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to publish log to RabbitMQ, falling back to stdout:',
        'RabbitMQ not available after timeout',
      );
    });

    it('should not fallback when publish succeeds', async () => {
      rabbitmqService.publish.mockResolvedValue(undefined);

      loggerService.log('success test');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});

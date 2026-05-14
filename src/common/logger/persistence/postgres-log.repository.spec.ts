import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PostgresLogRepository } from './postgres-log.repository';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';
import type { ILogMessage } from '../interfaces/log-message.interface';

describe('PostgresLogRepository', () => {
  let repository: PostgresLogRepository;
  let mockPool: { query: jest.Mock };

  const mockLogMessage: ILogMessage = {
    level: 'log',
    message: 'test message',
    context: 'TestContext',
    statusCode: 200,
    trace: null,
    createdAt: '2025-01-01T00:00:00.000Z',
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

  const expectedQuery = `
      INSERT INTO api_logs (
        level, message, context, status_code, trace, created_at,
        ip_address, host, full_url, path, http_method, protocol, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;

  const expectedValues = [
    mockLogMessage.level,
    mockLogMessage.message,
    mockLogMessage.context,
    mockLogMessage.statusCode,
    mockLogMessage.trace,
    mockLogMessage.createdAt,
    mockLogMessage.request.ipAddress,
    mockLogMessage.request.host,
    mockLogMessage.request.fullUrl,
    mockLogMessage.request.path,
    mockLogMessage.request.httpMethod,
    mockLogMessage.request.protocol,
    mockLogMessage.request.userId,
  ];

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    mockPool = {
      query: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        PostgresLogRepository,
        { provide: CustomToken.PG_POOL, useValue: mockPool },
      ],
    }).compile();

    repository = module.get(PostgresLogRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('insert', () => {
    it('should execute insert query with correct SQL and values', async () => {
      await repository.insert(mockLogMessage);

      expect(mockPool.query).toHaveBeenCalledWith(
        expectedQuery,
        expectedValues,
      );
    });

    it('should handle log message with all null fields', async () => {
      const nullMessage: ILogMessage = {
        level: 'error',
        message: 'null test',
        context: null,
        statusCode: null,
        trace: null,
        createdAt: '2025-01-01T00:00:00.000Z',
        request: {
          ipAddress: null,
          host: null,
          fullUrl: null,
          path: null,
          httpMethod: null,
          protocol: null,
          userId: null,
        },
      };

      await repository.insert(nullMessage);

      expect(mockPool.query).toHaveBeenCalledWith(expectedQuery, [
        nullMessage.level,
        nullMessage.message,
        nullMessage.context,
        nullMessage.statusCode,
        nullMessage.trace,
        nullMessage.createdAt,
        nullMessage.request.ipAddress,
        nullMessage.request.host,
        nullMessage.request.fullUrl,
        nullMessage.request.path,
        nullMessage.request.httpMethod,
        nullMessage.request.protocol,
        nullMessage.request.userId,
      ]);
    });

    it('should throw error when pool query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database connection error'));

      await expect(repository.insert(mockLogMessage)).rejects.toThrow(
        'Database connection error',
      );
    });
  });
});

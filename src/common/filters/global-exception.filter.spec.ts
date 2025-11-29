import { GlobalExceptionFilter } from './global-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import type { AppLogger } from '../interfaces/app-logger.interface';
import type { Request, Response } from 'express';

const mockLogger = {
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
};

const mockJson = jest.fn();
const mockStatus = jest.fn(() => ({ json: mockJson }));

const mockResponse: Partial<Response> = {
  status: mockStatus as unknown as Response['status'],
};

const mockRequest: Partial<Request> = {
  url: '/test-url',
};

const mockHost: ArgumentsHost = {
  switchToHttp: () => ({
    getRequest: () => mockRequest as Request,
    getResponse: () => mockResponse as Response,
  }),
} as ArgumentsHost;

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    jest.clearAllMocks();
    filter = new GlobalExceptionFilter(mockLogger as unknown as AppLogger);
  });

  it('should handle HttpException properly', () => {
    const exception = new HttpException(
      { message: 'Invalid input', error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Invalid input',
        error: 'Bad Request',
        path: '/test-url',
      }),
    );

    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should handle generic Error', () => {
    const exception = new Error('Something failed');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Something failed',
        error: 'Internal Server Error',
      }),
    );

    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should handle unknown exception', () => {
    const exception = 'unexpected';

    filter.catch(exception as unknown as Error, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      }),
    );

    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should handle HttpException with string response', () => {
    const exception = new HttpException('Access denied', 403);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(403);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: 'Access denied',
        error: 'Internal Server Error',
      }),
    );
  });

  it('should include timestamp and path in response', () => {
    const exception = new HttpException('Test', 418);

    filter.catch(exception, mockHost);

    const jsonCall = mockJson.mock.calls[0][0];

    expect(jsonCall.path).toBe('/test-url');
    expect(jsonCall.timestamp).toBeDefined();
  });
});

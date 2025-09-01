import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type { AppLogger } from '../logger/app-logger.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject('AppLogger') private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const responseData = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };

        message = responseData.message || 'Unknown error';
        error = responseData.error || 'Unknown Error';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      {
        method: request.method,
        url: request.url,
        statusCode: status,
        error,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
      exception instanceof Error ? exception.stack : undefined,
      GlobalExceptionFilter.name,
    );

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

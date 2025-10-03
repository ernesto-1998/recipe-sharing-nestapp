import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type { AppLogger } from '../interfaces/app-logger.interface';
import { CustomToken } from '../enums/custom-tokens-providers.enum';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(CustomToken.APP_LOGGER) private readonly logger: AppLogger,
  ) {}

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
      message,
      GlobalExceptionFilter.name,
      status,
      exception instanceof Error ? exception.stack : undefined,
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

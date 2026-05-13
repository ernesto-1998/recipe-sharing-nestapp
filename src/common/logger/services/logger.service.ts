import { Injectable } from '@nestjs/common';
import { LogLevel } from '../../enums/log-level.enum';
import { AppLogger } from '../../interfaces/app-logger.interface';
import { RequestContextService } from '../../context/request-context.service';
import { IRequestContext } from '../../context/interfaces/request-context.interface';
import { RabbitMQService } from 'src/common/rabbitmq/services/rabbitmq.service';
import { LOG_EXCHANGE, LOG_ROUTING_KEY } from '../constants/logger.constants';

@Injectable()
export class LoggerService implements AppLogger {
  private readonly exchange: string;
  private readonly routingKey: string;

  constructor(
    private readonly rabbitmqService: RabbitMQService,
    private readonly requestCtx: RequestContextService,
  ) {
    this.exchange = LOG_EXCHANGE;
    this.routingKey = LOG_ROUTING_KEY;
  }

  log(message: unknown, context?: string, statusCode?: number) {
    this.publish(LogLevel.LOG, message, context, statusCode);
  }

  error(
    message: unknown,
    context?: string,
    statusCode?: number,
    trace?: string,
  ) {
    this.publish(LogLevel.ERROR, message, context, statusCode, trace);
  }

  warn(message: unknown, context?: string, statusCode?: number) {
    this.publish(LogLevel.WARN, message, context, statusCode);
  }

  debug(message: unknown, context?: string, statusCode?: number) {
    this.publish(LogLevel.DEBUG, message, context, statusCode);
  }

  verbose(message: unknown, context?: string, statusCode?: number) {
    this.publish(LogLevel.VERBOSE, message, context, statusCode);
  }

  private publish(
    level: LogLevel,
    message: unknown,
    context?: string,
    statusCode?: number,
    trace?: string,
  ): void {
    const ctx: IRequestContext | undefined = this.requestCtx.getContext();

    const payload = {
      level,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      context: context ?? null,
      statusCode: statusCode ?? null,
      trace: trace ?? null,
      createdAt: new Date().toISOString(),
      request: {
        ipAddress: ctx?.ip_address ?? null,
        host: ctx?.host ?? null,
        fullUrl: ctx?.full_url ?? null,
        path: ctx?.path ?? null,
        httpMethod: ctx?.http_method ?? null,
        protocol: ctx?.protocol ?? null,
        userId: ctx?.user_id ?? null,
      },
    };

    this.rabbitmqService
      .publish(this.exchange, this.routingKey, payload)
      .catch((err: unknown) => {
        console.error(
          'Failed to publish log to RabbitMQ, falling back to stdout:',
          err instanceof Error ? err.message : err,
        );
        console.log(JSON.stringify(payload));
      });
  }
}

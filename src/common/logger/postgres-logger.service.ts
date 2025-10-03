import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';
import { LogLevel } from '../enums/log-level.enum';
import { AppLogger } from '../interfaces/app-logger.interface';
import { RequestContextService } from '../context/request-context.service';
import { IRequestContext } from '../context/interfaces/request-context.interface';

@Injectable()
export class PostgresLogger implements AppLogger, OnModuleInit {
  private readonly client: Client;
  private isConnected = false;

  constructor(private readonly requestCtx: RequestContextService) {
    const {
      POSTGRES_HOST,
      POSTGRES_PORT,
      POSTGRES_USER,
      POSTGRES_PASSWORD,
      POSTGRES_DB,
    } = process.env;

    this.client = new Client({
      host: POSTGRES_HOST ?? 'localhost',
      port: parseInt(POSTGRES_PORT ?? '5432', 10),
      user: POSTGRES_USER ?? 'neto',
      password: POSTGRES_PASSWORD ?? 'neto',
      database: POSTGRES_DB ?? 'recipe_logs_db',
    });
  }

  async onModuleInit() {
    const maxRetries = 10;
    const delayMs = 5000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.client.connect();
        this.isConnected = true;
        console.log('Successfully connected to Postgres.');
        return;
      } catch (err: unknown) {
        this.isConnected = false;
        const errorMsg =
          err instanceof Error && err.message.length < 100
            ? err.message
            : 'Postgres Engine is not ready';
        console.warn(
          `Postgres connection attempt ${attempt} failed: ${errorMsg}. Retrying in ${delayMs / 1000}s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    console.error(
      `Failed to connect to Postgres after ${maxRetries} attempts.`,
    );
  }

  log(message: unknown, context?: string, statusCode?: number) {
    this.insertLog(LogLevel.LOG, message, context, statusCode);
  }

  error(
    message: unknown,
    context?: string,
    statusCode?: number,
    trace?: string,
  ) {
    this.insertLog(LogLevel.ERROR, message, context, statusCode, trace);
  }

  warn(message: unknown, context?: string, statusCode?: number) {
    this.insertLog(LogLevel.WARN, message, context, statusCode);
  }

  debug(message: unknown, context?: string, statusCode?: number) {
    this.insertLog(LogLevel.DEBUG, message, context, statusCode);
  }

  verbose(message: unknown, context?: string, statusCode?: number) {
    this.insertLog(LogLevel.VERBOSE, message, context, statusCode);
  }

  private async insertLog(
    level: LogLevel,
    message: unknown,
    context?: string,
    statusCode?: number,
    trace?: string,
  ) {
    if (!this.isConnected) {
      console.error('Cannot insert log: PostgreSQL client is not connected.');
      return;
    }

    const formattedMessage =
      typeof message === 'string' ? message : JSON.stringify(message);
    const ctx: IRequestContext | undefined = this.requestCtx.getContext();

    const query = `
      INSERT INTO api_logs (
        level, message, context, created_at,
        ip_address, host, full_url, path,
        http_method, status_code, protocol, user_id, trace
      ) VALUES (
        $1, $2, $3, NOW(),
        $4, $5, $6, $7,
        $8, $9, $10, $11, $12
      );
    `;

    const params = [
      level,
      formattedMessage,
      context || null,
      ctx?.ip_address || null,
      ctx?.host || null,
      ctx?.full_url || null,
      ctx?.path || null,
      ctx?.http_method || null,
      statusCode || null,
      ctx?.protocol || null,
      ctx?.user_id || null,
      trace || null,
    ];

    try {
      await this.client.query(query, params);
    } catch (err) {
      console.error('Failed to insert log into PostgreSQL:', err);
    }
  }
}

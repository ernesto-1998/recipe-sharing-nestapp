import { Injectable, Inject, Scope, OnModuleInit } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { Client } from 'pg';

import { LogLevel } from '../enums/log-level.enum';
import { AppLogger } from '../interfaces/app-logger.interface';
import { ILoggingContext } from '../interfaces/express';

@Injectable({ scope: Scope.REQUEST })
export class PostgresLogger implements AppLogger, OnModuleInit {
  private readonly client: Client;
  private isConnected: boolean = false;
  private readonly loggingContext: ILoggingContext | null;

  constructor(@Inject(REQUEST) private readonly request: Request) {
    const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;

    this.client = new Client({
      host: POSTGRES_HOST ?? 'localhost',
      port: parseInt(POSTGRES_PORT ?? '5432', 10),
      user: POSTGRES_USER ?? 'neto',
      password: POSTGRES_PASSWORD ?? 'neto',
      database: POSTGRES_DB ?? 'recipe_logs_db',
    });

    this.loggingContext = this.request?.loggingContext || null;
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.isConnected = true;
    } catch (err) {
      this.isConnected = false;
      console.error('Failed to connect to PostgreSQL:', err);
    }
  }

  log(message: unknown, context?: string, statusCode?: number) {
    const formatted = typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.LOG, formatted, context, statusCode);
  }

  error(message: unknown, context?: string, statusCode?: number, trace?: string) {
    const formatted = typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.ERROR, formatted, context, statusCode, trace);
  }

  warn(message: unknown, context?: string, statusCode?: number) {
    const formatted = typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.WARN, formatted, context, statusCode);
  }

  debug(message: unknown, context?: string, statusCode?: number) {
    const formatted = typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.DEBUG, formatted, context, statusCode);
  }

  verbose(message: unknown, context?: string, statusCode?: number) {
    const formatted = typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.VERBOSE, formatted, context, statusCode);
  }

  private async insertLog(
    level: LogLevel,
    message: string,
    context?: string,
    statusCode?: number,
    trace?: string,   
  ) {
    if (!this.isConnected) {
      console.error('Cannot insert log: PostgreSQL client is not connected.');
      return;
    }
    

    const query = `
      INSERT INTO api_logs (
        level, message, context, created_at,
        ip_address, url, http_method, status_code, user_id, trace
      ) VALUES (
        $1, $2, $3, NOW(),
        $4, $5, $6, $7, $8, $9
      );
    `;

    const params = [
      level,
      message,
      context || null,
      this.loggingContext?.ip_address || null,
      this.loggingContext?.url || null,
      this.loggingContext?.http_method || null,
      statusCode || null,
      this.loggingContext?.user_id || null,
      trace || null,
    ];

    try {
      await this.client.query(query, params);
    } catch (err) {
      console.error('Failed to insert log into PostgreSQL:', err);
    }
  }
}

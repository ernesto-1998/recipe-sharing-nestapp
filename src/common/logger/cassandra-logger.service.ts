import { Injectable } from '@nestjs/common';
import { Client, types } from 'cassandra-driver';

import { LogLevel } from '../enums/log-level.enum';
import { AppLogger } from '../interfaces/app-logger.interface';

@Injectable()
export class CassandraLogger implements AppLogger {
  private readonly client: Client;
  private isConnected: boolean = false;

  constructor() {
    const { CASSANDRA_HOST, CASSANDRA_DATACENTER } = process.env;
    this.client = new Client({
      contactPoints: [CASSANDRA_HOST ?? 'localhost'],
      localDataCenter: CASSANDRA_DATACENTER ?? 'datacenter1',
    });
  }

  async onModuleInit() {
    const maxRetries = 10;
    const delayMs = 5000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.client.connect();
        this.isConnected = true;
        console.log('Successfully connected to Cassandra.');
        return;
      } catch (err: unknown) {
        this.isConnected = false;
        const errorMsg =
          err instanceof Error && err?.message.length < 100
            ? err?.message
            : 'Cassandra Engine is not ready';

        console.warn(
          `Cassandra connection attempt ${attempt} failed: ${errorMsg}. Retrying in ${
            delayMs / 1000
          }s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    console.error(
      `Failed to connect to Cassandra after ${maxRetries} attempts.`,
    );
  }

  log(message: unknown, context?: string) {
    const formatted =
      typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.LOG, formatted, context);
  }

  error(message: unknown, context?: string, statusCode?: number, trace?: string) {
    const formatted =
      typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.ERROR, formatted, context, trace);
  }

  warn(message: unknown, context?: string) {
    const formatted =
      typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.WARN, formatted, context);
  }

  debug(message: unknown, context?: string) {
    const formatted =
      typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.DEBUG, formatted, context);
  }

  verbose(message: unknown, context?: string) {
    const formatted =
      typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.VERBOSE, formatted, context);
  }

  private async insertLog(
    level: LogLevel,
    message: string,
    context?: string,
    trace?: string,
  ) {
    if (!this.isConnected) {
      console.error('Cannot insert log: Cassandra client is not connected.');
      return;
    }

    let query: string;
    let params: any[];

    if (level === LogLevel.ERROR) {
      query = `INSERT INTO recipe_logs.api_errors (id, message, trace, context, created_at) VALUES (?, ?, ?, ?, ?);`;
      params = [
        types.Uuid.random(),
        message,
        trace || null,
        context || null,
        new Date(),
      ];
    } else {
      query = `INSERT INTO recipe_logs.api_logs (id, level, message, context, created_at) VALUES (?, ?, ?, ?, ?);`;
      params = [
        types.Uuid.random(),
        level,
        message,
        context || null,
        new Date(),
      ];
    }

    try {
      await this.client.execute(query, params, { prepare: true });
    } catch (err) {
      console.error('Failed to insert log into Cassandra:', err);
    }
  }
}

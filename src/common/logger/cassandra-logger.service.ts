import { Injectable, LoggerService } from '@nestjs/common';
import { Client, types } from 'cassandra-driver';

import { LogLevel } from '../enums/log-level.enum';

@Injectable()
export class CassandraLogger implements LoggerService {
  private readonly client: Client;
  private isConnected: boolean = false;

  constructor() {
    const { CASSANDRA_HOST } = process.env;
    this.client = new Client({
      contactPoints: [CASSANDRA_HOST ?? 'localhost'],
      localDataCenter: 'datacenter1',
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.isConnected = true;
      console.log('Successfully connected to Cassandra.');
    } catch (err) {
      this.isConnected = false;
      console.error('Connection to Cassandra failed.', err);
    }
  }

  log(message: any, context?: string) {
    const formatted =
      typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.LOG, formatted, context);
  }

  error(message: any, trace?: string, context?: string) {
    const formatted =
      typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.ERROR, formatted, context, trace);
  }

  warn(message: any, context?: string) {
    const formatted =
      typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.WARN, formatted, context);
  }

  debug(message: any, context?: string) {
    const formatted =
      typeof message === 'string' ? message : JSON.stringify(message);
    this.insertLog(LogLevel.DEBUG, formatted, context);
  }

  verbose(message: any, context?: string) {
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

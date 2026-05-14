import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';
import { ILogMessage } from '../interfaces/log-message.interface';

@Injectable()
export class PostgresLogRepository {
  private readonly logger = new Logger(PostgresLogRepository.name);

  constructor(@Inject(CustomToken.PG_POOL) private readonly pool: Pool) {}

  async insert(log: ILogMessage): Promise<void> {
    const query = `
      INSERT INTO api_logs (
        level, message, context, status_code, trace, created_at,
        ip_address, host, full_url, path, http_method, protocol, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;

    const values = [
      log.level,
      log.message,
      log.context,
      log.statusCode,
      log.trace,
      log.createdAt,
      log.request.ipAddress,
      log.request.host,
      log.request.fullUrl,
      log.request.path,
      log.request.httpMethod,
      log.request.protocol,
      log.request.userId,
    ];

    try {
      await this.pool.query(query, values);
    } catch (error) {
      this.logger.error('Failed to insert log entry into PostgreSQL', error);
      throw error;
    }
  }
}

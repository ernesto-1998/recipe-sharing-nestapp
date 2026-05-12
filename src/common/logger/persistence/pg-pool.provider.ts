import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class PgPoolProvider implements OnModuleDestroy {
  readonly pool: Pool;

  constructor(configService: ConfigService) {
    this.pool = new Pool({
      host: configService.get('POSTGRES_HOST', 'localhost'),
      port: configService.get('POSTGRES_PORT', 5432),
      user: configService.get('POSTGRES_USER', 'neto'),
      password: configService.get('POSTGRES_PASSWORD', 'neto'),
      database: configService.get('POSTGRES_DB', 'recipe_logs_db'),
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    this.pool.on('error', (err) => {
      new Logger('PG_POOL').error('Unexpected PostgreSQL pool error', err);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

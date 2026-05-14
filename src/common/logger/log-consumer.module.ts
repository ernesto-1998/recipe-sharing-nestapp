import { Module } from '@nestjs/common';
import { RabbitMQModule } from 'src/common/rabbitmq/rabbitmq.module';
import { PgPoolProvider } from './persistence/pg-pool.provider';
import { PostgresLogRepository } from './persistence/postgres-log.repository';
import { LogConsumer } from './consumers/log.consumer';
import { CustomToken } from '../enums/custom-tokens-providers.enum';

@Module({
  imports: [RabbitMQModule],
  providers: [
    PgPoolProvider,
    {
      provide: CustomToken.PG_POOL,
      useFactory: (provider: PgPoolProvider) => provider.pool,
      inject: [PgPoolProvider],
    },
    PostgresLogRepository,
    LogConsumer,
  ],
})
export class LogConsumerModule {}

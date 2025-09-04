import { Global, Module } from '@nestjs/common';
import { CassandraLogger } from './cassandra-logger.service';

@Global()
@Module({
  providers: [
    CassandraLogger,
    {
      provide: 'AppLogger',
      useExisting: CassandraLogger,
    },
  ],
  exports: ['AppLogger'],
})
export class LoggerModule {}

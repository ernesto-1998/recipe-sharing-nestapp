import { Global, Module } from '@nestjs/common';
import { PostgresLogger } from './postgres-logger.service';

@Global()
@Module({
  providers: [
    PostgresLogger,
    {
      provide: 'AppLogger',
      useExisting: PostgresLogger,
    },
  ],
  exports: ['AppLogger'],
})
export class LoggerModule {}

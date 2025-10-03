import { Global, Module } from '@nestjs/common';
import { PostgresLogger } from './postgres-logger.service';
import { LoggerContextModule } from './logger-context.module';
import { CustomToken } from '../enums/custom-tokens-providers.enum';

@Global()
@Module({
  imports: [LoggerContextModule],
  providers: [
    PostgresLogger,
    {
      provide: CustomToken.APP_LOGGER,
      useExisting: PostgresLogger,
    },
  ],
  exports: [CustomToken.APP_LOGGER],
})
export class LoggerModule {}

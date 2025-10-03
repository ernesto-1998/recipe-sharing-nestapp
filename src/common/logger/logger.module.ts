import { Global, Module } from '@nestjs/common';
import { PostgresLogger } from './postgres-logger.service';
import { CustomToken } from '../enums/custom-tokens-providers.enum';
import { RequestContextModule } from '../context/request-context.module';

@Global()
@Module({
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

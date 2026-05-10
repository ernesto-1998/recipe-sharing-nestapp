import { Global, Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { CustomToken } from '../enums/custom-tokens-providers.enum';

@Global()
@Module({
  providers: [
    LoggerService,
    {
      provide: CustomToken.APP_LOGGER,
      useExisting: LoggerService,
    },
  ],
  exports: [CustomToken.APP_LOGGER],
})
export class LoggerModule {}

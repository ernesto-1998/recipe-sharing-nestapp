import { Logger, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { ILoggingContext } from '../../interfaces/express';
import { CustomToken } from '../../enums/custom-tokens-providers.enum';
import { LoggerContextService } from './logger-context.service';

@Module({
  providers: [
    {
      provide: CustomToken.LOGGER_CONTEXT_STORE,
      useValue: new AsyncLocalStorage<ILoggingContext>(),
    },
    LoggerContextService,
  ],
  exports: [LoggerContextService],
})
export class LoggerContextModule {}

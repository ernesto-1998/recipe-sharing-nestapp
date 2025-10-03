import { Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { ILoggingContext } from '../interfaces/express';
import { CustomToken } from '../enums/custom-tokens-providers.enum';

@Module({
  providers: [
    {
      provide: CustomToken.LOGGER_CONTEXT_STORE,
      useValue: new AsyncLocalStorage<ILoggingContext>(),
    },
  ],
  exports: [CustomToken.LOGGER_CONTEXT_STORE],
})
export class LoggerContextModule {}

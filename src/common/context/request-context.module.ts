import { Global, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestContextService } from './request-context.service';
import { CustomToken } from '../enums/custom-tokens-providers.enum';
import { IRequestContext } from './interfaces/request-context.interface';

@Global()
@Module({
  providers: [
    {
      provide: CustomToken.REQUEST_CONTEXT_STORE,
      useValue: new AsyncLocalStorage<IRequestContext>(),
    },
    RequestContextService,
  ],
  exports: [RequestContextService],
})
export class RequestContextModule {}

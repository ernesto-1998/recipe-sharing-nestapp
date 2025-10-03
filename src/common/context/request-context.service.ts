import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';
import { IRequestContext } from './interfaces/request-context.interface';

@Injectable()
export class RequestContextService {
  constructor(
    @Inject(CustomToken.REQUEST_CONTEXT_STORE)
    private readonly asyncLocalStorage: AsyncLocalStorage<IRequestContext>,
  ) {}

  getContext(): IRequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  getUserId(): string | null {
    return this.asyncLocalStorage.getStore()?.user_id ?? null;
  }

  setProperty<K extends keyof IRequestContext>(
    key: K,
    value: IRequestContext[K],
  ) {
    const ctx = this.getContext();
    if (ctx) {
      ctx[key] = value;
    }
  }

  runWithContext(ctx: IRequestContext, fn: () => void) {
    this.asyncLocalStorage.run(ctx, fn);
  }
}

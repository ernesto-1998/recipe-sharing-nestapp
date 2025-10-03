import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';
import { ILoggingContext } from 'src/common/interfaces';

@Injectable()
export class LoggerContextService {
  constructor(
    @Inject(CustomToken.LOGGER_CONTEXT_STORE)
    private readonly asyncLocalStorage: AsyncLocalStorage<ILoggingContext>,
  ) {}

  getContext(): ILoggingContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  getUserId(): string | null {
    return this.asyncLocalStorage.getStore()?.user_id ?? null;
  }

  setProperty<K extends keyof ILoggingContext>(
    key: K,
    value: ILoggingContext[K],
  ) {
    const ctx = this.getContext();
    if (ctx) {
      ctx[key] = value;
    }
  }

  runWithContext(ctx: ILoggingContext, fn: () => void) {
    this.asyncLocalStorage.run(ctx, fn);
  }
}

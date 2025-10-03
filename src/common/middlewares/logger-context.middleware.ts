import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import type { ILoggingContext } from '../interfaces';
import { AsyncLocalStorage } from 'node:async_hooks';
import { CustomToken } from '../enums/custom-tokens-providers.enum';

@Injectable()
export class LoggerContextMiddleware implements NestMiddleware {
  constructor(
    @Inject(CustomToken.LOGGER_CONTEXT_STORE)
    private readonly asyncLocalStorage: AsyncLocalStorage<ILoggingContext>,
  ) {}
  use(req: Request, res: Response, next: NextFunction) {
    const protocol = req?.protocol || null;
    const host = req.get('host');

    const ctx: ILoggingContext = {
      ip_address: req.ip || null,
      host: host || null,
      full_url: `${protocol}://${host}${req.originalUrl}`,
      path: req.originalUrl || null,
      http_method: req.method || null,
      protocol,
      user_id: null,
    };

    this.asyncLocalStorage.run(ctx, () => next());
  }
}

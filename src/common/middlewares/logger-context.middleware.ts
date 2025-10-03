import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import type { ILoggingContext } from '../interfaces';
import { LoggerContextService } from '../logger/context/logger-context.service';

@Injectable()
export class LoggerContextMiddleware implements NestMiddleware {
  constructor(private readonly loggerCtx: LoggerContextService) {}

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

    this.loggerCtx.runWithContext(ctx, () => next());
  }
}

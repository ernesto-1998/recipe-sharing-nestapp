import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../logger/logger-context.storage';
import type { ILoggingContext } from '../interfaces';

@Injectable()
export class LoggerContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as { userId?: string } | undefined;

    const protocol = req?.protocol || null;
    const host = req.get('host');

    const ctx: ILoggingContext = {
      ip_address: req.ip || null,
      host: host || null,
      full_url: `${protocol}://${host}${req.originalUrl}`,
      path: req.path || null,
      http_method: req.method || null,
      protocol,
      user_id: user?.userId || null,
    };

    requestContext.run(ctx, () => next());
  }
}

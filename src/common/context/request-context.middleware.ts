import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from './request-context.service';
import { IRequestContext } from './interfaces/request-context.interface';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly requestCtx: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const protocol = req?.protocol || null;
    const host = req.get('host');

    const ctx: IRequestContext = {
      ip_address: req.ip || null,
      host: host || null,
      full_url: `${protocol}://${host}${req.originalUrl}`,
      path: req.originalUrl || null,
      http_method: req.method || null,
      protocol,
      user_id: null,
    };

    this.requestCtx.runWithContext(ctx, () => next());
  }
}

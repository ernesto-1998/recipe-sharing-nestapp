import { Request } from 'express';

export interface ILoggingContext {
  ip_address: string | null;
  path: string | null;
  http_method: string | null;
  user_id: string | null;
  host: string | null;
  full_url: string | null;
  protocol: string | null;
}

declare global {
  namespace Express {
    interface Request {
      loggingContext?: ILoggingContext;
    }
  }
}

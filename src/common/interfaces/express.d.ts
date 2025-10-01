import { Request } from 'express';

export interface ILoggingContext {
  ip_address: string | null;
  url: string | null;
  http_method: string | null;
  user_id: string | null;
}

declare global {
  namespace Express {
    interface Request {
      loggingContext?: ILoggingContext;
    }
  }
}
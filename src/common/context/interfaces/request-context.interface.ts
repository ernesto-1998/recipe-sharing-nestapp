import { Request } from 'express';

export interface IRequestContext {
  ip_address: string | null;
  path: string | null;
  http_method: string | null;
  user_id: string | null;
  host: string | null;
  full_url: string | null;
  protocol: string | null;
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ITokenUser } from 'src/modules/auth/interfaces';
import { ILoggingContext } from '../interfaces/express';

@Injectable()
export class LoggingContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    
    const user = request.user as ITokenUser;
    const userId = user?.userId;

    request.loggingContext = {
      ip_address: request?.ip || null,
      url: request?.url || null,
      http_method: request?.method || null,
      user_id: userId || null,
    } as ILoggingContext;

    return next.handle();
  }
}

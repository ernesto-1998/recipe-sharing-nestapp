import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ITokenPayload } from './interfaces';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ITokenPayload => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user as ITokenPayload;
  },
);

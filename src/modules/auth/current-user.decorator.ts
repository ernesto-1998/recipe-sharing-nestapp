import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ITokenUser } from './interfaces';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ITokenUser => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user as ITokenUser;
  },
);

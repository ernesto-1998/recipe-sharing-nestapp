import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ITokenUser } from 'src/modules/auth/interfaces';

@Injectable()
export class IsOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const user: ITokenUser | undefined = request.user as ITokenUser;
    const resourceId = request.params.id;

    if (!user || !user.userId || !resourceId) {
      throw new ForbiddenException(
        'User context or resource ID missing for validation.',
      );
    }

    if (user.userId !== resourceId) {
      throw new ForbiddenException('You can only manage your own resources.');
    }

    return true;
  }
}

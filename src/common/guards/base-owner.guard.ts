import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ITokenUser } from 'src/modules/auth/interfaces';
import { Request } from 'express';
import { IGenericService } from '../interfaces/generic-service.interface';
import { Types } from 'mongoose';

export abstract class BaseOwnerGuard implements CanActivate {
  constructor(
    protected readonly service: IGenericService,
    protected readonly ownerField: string,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as ITokenUser;
    const resourceId = request.params.id;

    if (!user || !user.userId || !resourceId) {
      throw new ForbiddenException('Missing user or resource ID.');
    }

    const resource = await this.service.findById(resourceId);
    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    let resourceOwnerId: unknown = resource[this.ownerField];

    if (resourceOwnerId instanceof Types.ObjectId) {
      resourceOwnerId = resourceOwnerId.toString();
    }

    if (resourceOwnerId !== user.userId) {
      throw new ForbiddenException('You do not own this resource.');
    }

    return true;
  }
}

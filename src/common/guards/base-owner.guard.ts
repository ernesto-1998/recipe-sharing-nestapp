import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { ITokenUser } from 'src/modules/auth/interfaces';
import { Request } from 'express';
import type { IGenericService } from '../interfaces/generic-service.interface';
import { Types } from 'mongoose';
import type { AppLogger } from '../interfaces/app-logger.interface';
import { CustomToken } from '../enums/custom-tokens-providers.enum';

export abstract class BaseOwnerGuard implements CanActivate {
  @Inject(CustomToken.APP_LOGGER) protected readonly logger: AppLogger;

  constructor(
    protected readonly service: IGenericService,
    protected readonly ownerField: string,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as ITokenUser;
    const resourceId = request.params.id;
    const contextName = BaseOwnerGuard.name;

    if (!user || !user.userId || !resourceId) {
      this.logger.warn(
        {
          message: 'Access denied due to missing user or resource ID.',
          path: request.path,
          userId: user?.userId,
        },
        contextName,
        HttpStatus.FORBIDDEN,
      );
      throw new ForbiddenException('Missing user or resource ID.');
    }
    if (user.isSuperUser) return true;
    const resource = await this.service.findById(resourceId);
    if (!resource) {
      this.logger.warn(
        {
          message: 'Resource not found for ownership check.',
          resourceId,
          userId: user.userId,
        },
        contextName,
        HttpStatus.NOT_FOUND,
      );
      throw new NotFoundException('Resource not found.');
    }

    let resourceOwnerId: unknown = resource[this.ownerField];

    if (resourceOwnerId instanceof Types.ObjectId) {
      resourceOwnerId = resourceOwnerId.toHexString();
    }

    if (resourceOwnerId !== user.userId) {
      this.logger.warn(
        {
          message:
            'Access denied. User attempted to access an unowned resource.',
          attemptedBy: user.userId,
          resourceId,
          ownerId: resourceOwnerId,
        },
        contextName,
        HttpStatus.FORBIDDEN,
      );
      throw new ForbiddenException('You do not own this resource.');
    }

    this.logger.verbose(
      {
        message: 'Ownership check passed successfully.',
        resourceId,
        userId: user.userId,
      },
      contextName,
      HttpStatus.OK,
    );

    return true;
  }
}

import { Injectable, Inject, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AsyncLocalStorage } from 'node:async_hooks';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';
import { ILoggingContext } from 'src/common/interfaces';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Inject(CustomToken.LOGGER_CONTEXT_STORE)
    private readonly asyncLocalStorage: AsyncLocalStorage<ILoggingContext>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const result = (await super.canActivate(context)) as boolean;

    if (result) {
      const request = context.switchToHttp().getRequest();
      const ctx = this.asyncLocalStorage.getStore();
      if (ctx && request.user?.userId) {
        ctx.user_id = request.user.userId;
      }
    }

    return result;
  }
}

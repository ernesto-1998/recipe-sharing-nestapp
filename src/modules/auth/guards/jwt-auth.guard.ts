import { Injectable, Inject, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AsyncLocalStorage } from 'node:async_hooks';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { LoggerContextService } from 'src/common/logger/context/logger-context.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly loggerCtx: LoggerContextService,
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
      this.loggerCtx.setProperty('user_id', request.user?.userId ?? null);
    }

    return result;
  }
}

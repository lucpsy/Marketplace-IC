import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ADMIN_KEY } from '../decorators/role.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) return true;

    const authenticated = await super.canActivate(context);

    if (!authenticated) return false;

    const isAdmin = this.reflector.getAllAndOverride<boolean>(
      ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isAdmin) {
      const req = context.switchToHttp().getRequest();

      if (req.user.role !== 'admin') {
        throw new ForbiddenException();
      }
    }

    return true;
  }
}
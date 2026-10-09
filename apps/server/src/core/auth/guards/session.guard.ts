import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY, REQUEST_SESSION_KEY, REQUEST_USER_KEY } from '../auth.constants.js';
import { toWebHeaders } from '../auth-headers.js';
import { AuthService } from '../auth.service.js';
import type { AuthSessionData, AuthUser } from '../auth.types.js';

export interface AuthenticatedRequest extends Request {
  [REQUEST_USER_KEY]?: AuthUser | null;
  [REQUEST_SESSION_KEY]?: AuthSessionData | null;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      request[REQUEST_USER_KEY] ??= null;
      request[REQUEST_SESSION_KEY] ??= null;
      return true;
    }

    const session = await this.authService.getSession(toWebHeaders(request));
    request[REQUEST_USER_KEY] = session?.user ?? null;
    request[REQUEST_SESSION_KEY] = session?.session ?? null;
    return true;
  }
}

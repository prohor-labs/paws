import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiError } from '../../../common/errors/api-error.js';
import { AUTHENTICATED_KEY, ROLES_KEY } from '../auth.constants.js';
import type { UserRole } from '../auth.types.js';
import type { AuthenticatedRequest } from './session.guard.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiresAuthentication = this.reflector.getAllAndOverride<boolean>(AUTHENTICATED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if ((!requiredRoles || requiredRoles.length === 0) && !requiresAuthentication) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) {
      throw ApiError.unauthorized();
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const role = (user.role ?? 'student') as UserRole;
    if (!requiredRoles.includes(role)) {
      throw ApiError.forbidden('এই অ্যাকশনটি সম্পন্ন করার প্রয়োজনীয় অনুমতি আপনার নেই।');
    }

    return true;
  }
}

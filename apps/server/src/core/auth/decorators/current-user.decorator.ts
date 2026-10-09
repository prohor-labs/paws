import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { REQUEST_SESSION_KEY, REQUEST_USER_KEY } from '../auth.constants.js';
import type { AuthSessionData, AuthUser } from '../auth.types.js';

interface AuthenticatedRequest {
  [REQUEST_USER_KEY]?: AuthUser | null;
  [REQUEST_SESSION_KEY]?: AuthSessionData | null;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser | null => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request[REQUEST_USER_KEY] ?? null;
  },
);

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthSessionData | null => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request[REQUEST_SESSION_KEY] ?? null;
  },
);

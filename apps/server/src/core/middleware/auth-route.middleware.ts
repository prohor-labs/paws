import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';
import type { AuthInstance } from '../auth/auth.config.js';
import { AUTH_INSTANCE } from '../auth/auth.constants.js';

@Injectable()
export class AuthRouteMiddleware implements NestMiddleware {
  private readonly handler: (request: Request, response: Response) => Promise<void>;

  constructor(@Inject(AUTH_INSTANCE) auth: AuthInstance) {
    this.handler = toNodeHandler(auth);
  }

  use(request: Request, response: Response, next: NextFunction): void {
    if (!request.originalUrl.startsWith('/api/auth')) {
      next();
      return;
    }
    void this.handler(request, response);
  }
}

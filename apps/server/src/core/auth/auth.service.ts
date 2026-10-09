import { Inject, Injectable } from '@nestjs/common';
import type { AuthInstance } from './auth.config.js';
import { AUTH_INSTANCE } from './auth.constants.js';
import type { AuthSessionResult } from './auth.types.js';

@Injectable()
export class AuthService {
  constructor(@Inject(AUTH_INSTANCE) private readonly auth: AuthInstance) {}

  get instance(): AuthInstance {
    return this.auth;
  }

  getSession(headers: Headers): Promise<AuthSessionResult> {
    return this.auth.api.getSession({ headers });
  }
}

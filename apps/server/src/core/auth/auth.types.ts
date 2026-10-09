import type { AuthInstance } from './auth.config.js';

export type UserRole = 'student' | 'mentor' | 'admin';

export type AuthSessionResult = Awaited<ReturnType<AuthInstance['api']['getSession']>>;
export type AuthSession = NonNullable<AuthSessionResult>;
export type AuthUser = AuthSession['user'];
export type AuthSessionData = AuthSession['session'];

export interface RequestAuth {
  user: AuthUser | null;
  session: AuthSessionData | null;
}

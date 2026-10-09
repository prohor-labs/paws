import { SetMetadata } from '@nestjs/common';
import { AUTHENTICATED_KEY, ROLES_KEY } from '../auth.constants.js';
import type { UserRole } from '../auth.types.js';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const Authenticated = () => SetMetadata(AUTHENTICATED_KEY, true);

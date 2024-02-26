import type { GroupSchema, UserSchema } from '@gitbeaker/rest';

import { glGroups } from './groups';
import { glUsers } from './users';

export const glInitial: Promise<[UserSchema[], GroupSchema[]]> = Promise.all([glUsers, glGroups]);

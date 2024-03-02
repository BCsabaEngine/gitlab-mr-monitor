import { z } from 'zod';

import { GitlabAccess } from './GitlabAccess';
import { Scope } from './Scope';

export const Configuration = z.object({
	gitlab: GitlabAccess,
	ignoredUsers: z.array(z.number()).default([]),
	scopes: z.array(Scope).default([]),
	autoRefreshSec: z.number().default(0)
});
export type Configuration = z.infer<typeof Configuration>;

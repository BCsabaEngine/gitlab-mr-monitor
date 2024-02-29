import { z } from 'zod';

import { GitlabAccess } from './GitlabAccess';
import { Scope } from './Scope';

export const Configuration = z.object({
	gitlab: GitlabAccess,
	ignoredUsers: z.array(z.string()).default([]),
	scopes: z.array(Scope).default([])
});
export type Configuration = z.infer<typeof Configuration>;

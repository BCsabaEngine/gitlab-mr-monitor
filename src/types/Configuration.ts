import { z } from 'zod';

import { GitlabAccess } from './GitlabAccess';

export const Configuration = z.object({
	gitlab: GitlabAccess,
	skippedUsers: z.array(z.string()).default([])
});
export type Configuration = z.infer<typeof Configuration>;

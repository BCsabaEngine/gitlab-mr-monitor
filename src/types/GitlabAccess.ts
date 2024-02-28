import { z } from 'zod';

export const GitlabAccess = z.object({
	host: z.string().url(),
	token: z.string().regex(/^glpat-.{12,24}$/)
});
export type GitlabAccess = z.infer<typeof GitlabAccess>;

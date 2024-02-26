import { z } from 'zod';

export const GitlabAccess = z.object({
	host: z.string(),
	token: z.string()
});
export type GitlabAccess = z.infer<typeof GitlabAccess>;

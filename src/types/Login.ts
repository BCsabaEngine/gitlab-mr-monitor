import { z } from 'zod';

export const Login = z.object({
	host: z.string().url(),
	token: z.string().regex(/^glpat-.{12,24}$/)
});
export type Login = z.infer<typeof Login>;

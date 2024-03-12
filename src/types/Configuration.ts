import { z } from 'zod';

import { Scope } from './Scope';

export const Configuration = z.object({
	scopes: z.array(Scope).default([]),
	ignoredUsers: z.array(z.number()).default([])
});
export type Configuration = z.infer<typeof Configuration>;

import { z } from 'zod';

export const UserPreferences = z.object({
	autoRefreshSec: z.number().default(0)
});
export type UserPreferences = z.infer<typeof UserPreferences>;

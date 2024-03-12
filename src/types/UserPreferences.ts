import { z } from 'zod';

export const UserPreferenceDarkMode = z.enum(['system', 'light', 'dark']).default('system');
export type UserPreferenceDarkMode = z.infer<typeof UserPreferenceDarkMode>;

export const UserPreferences = z.object({
	autoRefreshSec: z.number().default(0),
	darkMode: UserPreferenceDarkMode
});
export type UserPreferences = z.infer<typeof UserPreferences>;

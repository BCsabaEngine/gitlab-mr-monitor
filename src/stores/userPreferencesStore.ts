import { get, type Updater } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

import { UserPreferences } from '$types/UserPreferences';

const emptyuserPreferences: UserPreferences = {
	autoRefreshSec: 0,
	darkMode: 'system'
};

export const userPreferencesJsonSerializer = {
	parse: (text: string) => {
		try {
			return UserPreferences.parse(JSON.parse(text));
		} catch {
			return emptyuserPreferences;
		}
	},
	stringify: (object: UserPreferences) => JSON.stringify(object)
};

export const userPreferencesStore = persisted<UserPreferences>(
	'userpreferences',
	emptyuserPreferences,
	{
		syncTabs: true,
		storage: 'local',
		serializer: userPreferencesJsonSerializer
	}
);

export const getUserPreferencesStoreValue = (): UserPreferences => get(userPreferencesStore);
export const updateUserPreferencesStoreValue = (updater: Updater<UserPreferences>) =>
	userPreferencesStore.update(updater);

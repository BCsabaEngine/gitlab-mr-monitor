import { get, type Updater } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

import type { UserPreferences } from '$types/UserPreferences';

const emptyuserPreferences: UserPreferences = {
	autoRefreshSec: 0
};

export const userPreferencesStore = persisted<UserPreferences>(
	'userpreferences',
	emptyuserPreferences,
	{
		syncTabs: true,
		storage: 'local'
	}
);

export const getLoginStoreValue = (): UserPreferences => get(userPreferencesStore);
export const setLoginStoreValue = (login: UserPreferences) => userPreferencesStore.set(login);
export const updateLoginStoreValue = (updater: Updater<UserPreferences>) =>
	userPreferencesStore.update(updater);

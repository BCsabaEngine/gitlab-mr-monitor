import { derived } from 'svelte/store';

import { isCurrentDarkMode } from '$lib/darkMode';
import type { UserPreferenceDarkMode } from '$types/UserPreferences';

import { getUserPreferencesStoreValue, userPreferencesStore } from './userPreferencesStore';

const isDarkByMode = (mode: UserPreferenceDarkMode): boolean | undefined => {
	switch (mode) {
		case 'dark':
			return true;
		case 'light':
			return false;
		default:
			return undefined;
	}
};

let timerObject: NodeJS.Timeout;
export const createDarkStore = (intervalSec: number) =>
	derived(
		userPreferencesStore,
		($userPreferencesStore, set) => {
			clearInterval(timerObject);

			const isDark = isDarkByMode($userPreferencesStore.darkMode);
			if (isDark === undefined) {
				timerObject = setInterval(() => set(isCurrentDarkMode()), intervalSec * 1000);
				set(isCurrentDarkMode());
			} else set(isDark);

			return () => clearInterval(timerObject);
		},
		isDarkByMode(getUserPreferencesStoreValue().darkMode) || isCurrentDarkMode()
	);

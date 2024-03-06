import { derived } from 'svelte/store';

import { userPreferencesStore } from './userPreferencesStore';

let counter = 0;
let timerObject: NodeJS.Timeout;
export const refreshTimer = derived(
	userPreferencesStore,
	($userPreferencesStore, set) => {
		clearInterval(timerObject);
		if ($userPreferencesStore.autoRefreshSec > 0)
			timerObject = setInterval(() => set(counter++), $userPreferencesStore.autoRefreshSec * 1000);

		return () => clearInterval(timerObject);
	},
	0
);

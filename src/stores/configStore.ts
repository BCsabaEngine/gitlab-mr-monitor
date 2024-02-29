import { derived, get, type Updater } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

import { Configuration } from '$types/Configuration';

const emptyConfiguration: Configuration = {
	gitlab: {
		host: '',
		token: ''
	},
	ignoredUsers: [],
	scopes: []
};

export const configurationJsonSerializer = {
	parse: (text: string) => {
		try {
			return Configuration.parse(JSON.parse(text));
		} catch {
			return emptyConfiguration;
		}
	},
	stringify: (object: Configuration) => JSON.stringify(object, undefined, 2)
};

export const configurationStore = persisted<Configuration>('configuration', emptyConfiguration, {
	syncTabs: true,
	storage: 'local',
	serializer: configurationJsonSerializer
});

export const getConfigurationStoreValue = (): Configuration => get(configurationStore);
export const setConfigurationStoreValue = (configuration: Configuration) =>
	configurationStore.set(configuration);
export const updateConfigurationStoreValue = (updater: Updater<Configuration>) =>
	configurationStore.update(updater);

export const configurationMissing = derived(
	configurationStore,
	($cfg) => !$cfg.gitlab.host || !$cfg.gitlab.token
);

export const configurationHash = derived(
	configurationStore,
	($cfg) => $cfg.gitlab.host + $cfg.gitlab.token
);

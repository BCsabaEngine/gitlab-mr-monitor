import { get, type Updater } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

import { Configuration } from '$types/Configuration';
import type { Scope } from '$types/Scope';

const defaultSelfAuthor: Scope = {
	mode: 'self-author',
	name: 'Me as author',
	enabled: true,
	draft: false
};
const defaultSelfReviewer: Scope = {
	mode: 'self-reviewer',
	name: 'Me as reviewer',
	enabled: true,
	draft: false,
	alert: true
};
const emptyConfiguration: Configuration = {
	ignoredUsers: [],
	scopes: [defaultSelfAuthor, defaultSelfReviewer]
};

export const configurationJsonSerializer = {
	parse: (text: string) => {
		try {
			const config = Configuration.parse(JSON.parse(text));
			if (!config.scopes.some((s) => s.mode === 'self-author'))
				config.scopes.push(defaultSelfAuthor);
			if (!config.scopes.some((s) => s.mode === 'self-reviewer'))
				config.scopes.push(defaultSelfReviewer);
			return config;
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

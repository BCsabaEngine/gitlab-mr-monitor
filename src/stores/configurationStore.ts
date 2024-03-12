import { get, type Updater } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

import { Configuration } from '$types/Configuration';
import type { Scope } from '$types/Scope';

const defaultSelfAuthor: Scope = {
	mode: 'self-author',
	name: 'Me as author',
	enabled: true,
	draft: false,
	pipeline: true
};
const defaultSelfReviewer: Scope = {
	mode: 'self-reviewer',
	name: 'Me as reviewer',
	enabled: true,

	projects: [],
	groups: [],

	draft: false,
	hideMergeable: false,
	alert: true,
	pipeline: true
};
const emptyConfiguration: Configuration = {
	ignoredUsers: [],
	scopes: [defaultSelfReviewer, defaultSelfAuthor]
};

export const configurationJsonSerializer = {
	parse: (text: string) => {
		try {
			const config = Configuration.parse(JSON.parse(text));
			if (!config.scopes.some((s) => s.mode === 'self-reviewer'))
				config.scopes.push(defaultSelfReviewer);
			if (!config.scopes.some((s) => s.mode === 'self-author'))
				config.scopes.push(defaultSelfAuthor);
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

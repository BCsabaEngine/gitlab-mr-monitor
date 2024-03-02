import { derived, get, type Updater } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

import { Configuration } from '$types/Configuration';
import type { Scope } from '$types/Scope';

const emptyConfiguration: Configuration = {
	gitlab: {
		host: '',
		token: ''
	},
	ignoredUsers: [],
	scopes: [],
	autoRefreshSec: 0
};
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

export const configurationMissing = derived(
	configurationStore,
	($cfg) => !$cfg.gitlab.host || !$cfg.gitlab.token
);

export const configurationHash = derived(
	configurationStore,
	($cfg) => $cfg.gitlab.host + $cfg.gitlab.token
);

export const dummyScopes: Scope[] = [
	{
		name: 'Me as author',
		mode: 'self-author',
		enabled: true,
		draft: true
	},
	{
		name: 'Me as reviewer',
		mode: 'self-reviewer',
		enabled: true,
		draft: true,
		alert: true
	},
	{
		name: 'Favorite projects',
		mode: 'project',
		enabled: true,
		projects: ['805', '852', '47'],
		alert: false,
		days: 7,
		draft: false
	},
	{
		name: 'Alternate projects',
		mode: 'project',
		enabled: true,
		projects: ['802', '852'],
		alert: false,
		days: 7,
		draft: true
	}
];

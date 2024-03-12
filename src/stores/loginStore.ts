import { derived, get, type Updater } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

import { Login } from '$types/Login';

const emptyLogin: Login = {
	host: '',
	token: ''
};

export const loginJsonSerializer = {
	parse: (text: string) => {
		try {
			return Login.parse(JSON.parse(text));
		} catch {
			return emptyLogin;
		}
	},
	stringify: (object: Login) => JSON.stringify(object)
};

export const loginStore = persisted<Login>('login', emptyLogin, {
	syncTabs: true,
	storage: 'local',
	serializer: loginJsonSerializer
});

export const getLoginStoreValue = (): Login => get(loginStore);
export const setLoginStoreValue = (login: Login) => loginStore.set(login);
export const updateLoginStoreValue = (updater: Updater<Login>) => loginStore.update(updater);
export const resetLoginStoreValue = () => updateLoginStoreValue(() => emptyLogin);

export const loginMissing = derived(loginStore, ($login) => !$login.host || !$login.token);
export const loginHash = derived(loginStore, ($login) => $login.host + $login.token);

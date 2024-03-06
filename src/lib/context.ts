import { getContext, setContext } from 'svelte';

export interface Context<T> {
	get: () => T;
	set: (context: T) => T;
}

export function createContext<T>(): Context<T> {
	const key = `$$context_${crypto.randomUUID()}`;
	return {
		get: () => getContext<T>(key),
		set: (context: T) => setContext(key, context)
	};
}

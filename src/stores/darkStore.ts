import { readable } from 'svelte/store';

const getDarkMode = (): boolean => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const createDarkStore = (intervalSec: number) =>
	readable(getDarkMode(), (set) => {
		const timerObject = setInterval(() => set(getDarkMode()), intervalSec * 1000);
		return () => clearInterval(timerObject);
	});

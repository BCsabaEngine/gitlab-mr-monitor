import { readable } from 'svelte/store';

export const darkStore = (intervalSec: number) =>
	readable(false, (set) => {
		const timerObject = setInterval(
			() => set(window.matchMedia('(prefers-color-scheme: dark)').matches),
			intervalSec * 1000
		);
		return () => clearInterval(timerObject);
	});

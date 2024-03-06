import { createDarkStore } from '$stores/darkStore';

const WATCH_INTERVAL_SEC = 60;
const classes = window.document.documentElement.classList;

export const isCurrentDarkMode = (): boolean =>
	window.matchMedia('(prefers-color-scheme: dark)').matches;
export const toggleDark = () => classes.toggle('dark');
export const setDark = () => classes.add('dark');
export const resetDark = () => classes.remove('dark');

export const init = () =>
	createDarkStore(WATCH_INTERVAL_SEC).subscribe((isDark) => (isDark ? setDark() : resetDark()));

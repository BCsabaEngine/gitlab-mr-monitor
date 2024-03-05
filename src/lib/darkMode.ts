import { createDarkStore } from '$stores/darkStore';

const classes = window.document.documentElement.classList;

export const toggleDark = () => classes.toggle('dark');
export const setDark = () => classes.add('dark');
export const resetDark = () => classes.remove('dark');

createDarkStore(60).subscribe((isDark) => (isDark ? setDark() : resetDark()));

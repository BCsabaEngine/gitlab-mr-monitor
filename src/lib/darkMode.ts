import { darkStore } from '$stores/darkStore';

const classes = window.document.documentElement.classList;

export const toggleDark = () => classes.toggle('dark');
export const setDark = () => classes.add('dark');
export const resetDark = () => classes.remove('dark');

darkStore(60).subscribe((isDark) => (isDark ? setDark() : resetDark()));

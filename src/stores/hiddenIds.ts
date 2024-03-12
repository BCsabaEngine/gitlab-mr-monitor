import dayjs from 'dayjs';
import { derived, get, type Updater } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

type HiddenIds = Record<string, number[]>;

const emptyHiddenIds: HiddenIds = {};

const getToday = () => dayjs().format('YYYYMMDD');

export const hiddenIdsJsonSerializer = {
	parse: (text: string) => {
		try {
			return JSON.parse(text);
		} catch {
			return emptyHiddenIds;
		}
	},
	stringify: (object: HiddenIds) => JSON.stringify(object)
};

export const hiddenIdsStore = persisted<HiddenIds>('hiddenids', emptyHiddenIds, {
	syncTabs: true,
	storage: 'local',
	serializer: hiddenIdsJsonSerializer
});

export const getHiddenIdsStoreValue = (): HiddenIds => get(hiddenIdsStore);
export const updateHiddenIdsStoreValue = (updater: Updater<HiddenIds>) =>
	hiddenIdsStore.update(updater);
export const resetHiddenIdsStoreValue = () => updateHiddenIdsStoreValue(() => ({}));
export const resetTodayHiddenIdsStoreValue = () =>
	updateHiddenIdsStoreValue((values) => {
		const today = getToday();
		if (Object.keys(values).includes(today)) delete values[today];
		return values;
	});

export const hiddenIdsLength = derived(hiddenIdsStore, ($hiddenIdsStore) =>
	Object.values($hiddenIdsStore).reduce((p, c) => (p += c.length), 0)
);

export const isHiddenId = (hiddeIds: HiddenIds, id: number) =>
	Object.values(hiddeIds).some((ids) => ids.includes(id));

export const addHiddenId = (id: number) =>
	updateHiddenIdsStoreValue((values) => {
		if (!isHiddenId(values, id)) {
			const today = getToday();
			if (!Object.keys(values).includes(today)) values[today] = [];
			values[today].push(id);
		}
		return values;
	});

export const maintenanceHiddenIds = (daysLeft: number = 60) =>
	updateHiddenIdsStoreValue((values) => {
		const todayMinusDays = dayjs().subtract(daysLeft, 'day').format('YYYYMMDD');
		for (const key of Object.keys(values)) if (key < todayMinusDays) delete values[key];
		return values;
	});

setInterval(() => maintenanceHiddenIds(), 1 * 60 * 60 * 1000);
maintenanceHiddenIds();

export const todayHiddenIdsStore = derived(
	hiddenIdsStore,
	($hiddenIdsStore, set) => {
		const today = getToday();
		set(Object.keys($hiddenIdsStore).includes(today) ? $hiddenIdsStore[today].length : 0);
	},
	0
);

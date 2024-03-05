const hiddenIds: number[] = [];

export const hideMr = (mrId: number) => {
	if (!hiddenIds.includes(mrId)) hiddenIds.push(mrId);
};

export const isMrHidden = (mrId: number) => hiddenIds.includes(mrId);

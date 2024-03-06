<script lang="ts">
	import type { MergeRequestSchemaWithBasicLabels } from '@gitbeaker/rest';
	import { CaretRightSolid } from 'flowbite-svelte-icons';
	import { createEventDispatcher, onMount } from 'svelte';

	import { generateMrPromisesFromScope, glCurrentUser } from '$lib/gitlab';
	import { type MergeRequest, postProcess, sortByProjectAndTitle } from '$lib/mr';
	import { addHiddenId } from '$stores/hiddenIds';
	import type { Scope } from '$types/Scope';

	import { isBackground } from './base/IsBackground.svelte';
	import Mr from './Mr.svelte';
	const dispatch = createEventDispatcher<{
		count: { sessionId: number; count: number };
		alert: { sessionId: number };
	}>();

	export let scope: Scope;

	let mrPromises: Promise<MergeRequestSchemaWithBasicLabels[][]>;
	let mrs: MergeRequest[] = [];
	let previousMrsIds: number[] = [];
	let arrivalMrsIds: number[] = [];
	let lastSessionId: number;
	export const refresh = async (sessionId: number, background: boolean) => {
		lastSessionId = sessionId;

		const currentuser = await glCurrentUser;
		mrPromises = background
			? Promise.resolve(await generateMrPromisesFromScope(scope, currentuser))
			: generateMrPromisesFromScope(scope, currentuser);
		mrPromises.then(async (value) => {
			mrs = await postProcess(scope, value);
			dispatch('count', { sessionId, count: mrs.length });

			const mrsIds = mrs.map((m) => m.id);
			const recentIds = mrsIds.filter((mid) => !previousMrsIds.includes(mid));
			if (recentIds.length > 0 && 'alert' in scope && scope.alert) dispatch('alert', { sessionId });
			if ($isBackground) arrivalMrsIds.push(...recentIds);
			else arrivalMrsIds = [];

			previousMrsIds = mrsIds;

			mrs = await sortByProjectAndTitle(mrs);
		});
	};

	onMount(() => {
		refresh(0, false);
	});
	const onRemove = (mrId: number) => {
		addHiddenId(mrId);

		const index = mrs.findIndex((mr) => mr.id === mrId);
		if (index < 0) return;

		mrs.splice(index, 1);
		mrs = mrs;
		dispatch('count', { sessionId: lastSessionId, count: mrs.length });
	};
	const onConfirmNew = (mdId: number) => {
		let index = arrivalMrsIds.indexOf(mdId);
		while (index >= 0) {
			arrivalMrsIds.splice(index, 1);
			index = arrivalMrsIds.indexOf(mdId);
		}
		arrivalMrsIds = arrivalMrsIds;
	};
</script>

{#await mrPromises then}
	{#if mrs && mrs.length > 0}
		<div class="container mx-auto pb-4">
			<span class="flex items-center ml-2 text-lg dark:text-gray-200"
				><CaretRightSolid class="mr-2" />
				{scope.name}
				<span class="text-xs mt-0.5 ml-2">{mrs.length}</span>
			</span>
			<div class="mt-2 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each mrs as mr (mr.id)}
					<Mr
						{mr}
						markedNew={arrivalMrsIds.includes(mr.id)}
						on:confirmNew={(id) => onConfirmNew(id.detail)}
						on:close={(id) => onRemove(id.detail)}
						on:refresh={() => refresh(lastSessionId, true)}
					/>
				{/each}
			</div>
		</div>
	{/if}
{/await}

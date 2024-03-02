<script lang="ts">
	import type { MergeRequestSchemaWithBasicLabels } from '@gitbeaker/rest';
	import { CaretRightSolid } from 'flowbite-svelte-icons';
	import { createEventDispatcher, onMount } from 'svelte';

	import { generateMrPromisesFromScope, glCurrentUser } from '$lib/gitlab';
	import { type MergeRequest, postProcess } from '$lib/mr';
	import type { Scope } from '$types/Scope';

	import Mr from './Mr.svelte';
	const dispatch = createEventDispatcher<{
		count: { sessionId: number; count: number };
		alert: { sessionId: number };
	}>();

	export let scope: Scope;

	let mrPromises: Promise<MergeRequestSchemaWithBasicLabels[][]>;
	let mrs: MergeRequest[] = [];
	let previousMrsIds: number[] = [];
	export const refresh = async (sessionId: number, background: boolean) => {
		const currentuser = await glCurrentUser;
		mrPromises = background
			? Promise.resolve(await generateMrPromisesFromScope(scope, currentuser))
			: generateMrPromisesFromScope(scope, currentuser);
		mrPromises.then(async (value) => {
			mrs = await postProcess(scope, value);
			dispatch('count', { sessionId, count: mrs.length });

			const mrsIds = mrs.map((m) => m.id);
			if ('alert' in scope && scope.alert && mrsIds.some((mid) => !previousMrsIds.includes(mid)))
				dispatch('alert', { sessionId });
			previousMrsIds = mrsIds;
		});
	};

	onMount(() => {
		refresh(0, false);
	});
</script>

{#await mrPromises then}
	{#if mrs && mrs.length > 0}
		<div class="container mx-auto pb-4">
			<span class="flex items-center ml-2 text-lg dark:text-gray-200"
				><CaretRightSolid class="mr-2" />{scope.name}
			</span>
			<div class="mt-2 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each mrs as mr (mr.id)}
					<Mr {mr} />
				{/each}
			</div>
		</div>
	{/if}
{/await}

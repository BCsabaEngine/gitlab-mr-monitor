<script lang="ts">
	import type { MergeRequestSchemaWithBasicLabels } from '@gitbeaker/rest';
	import { CaretRightSolid } from 'flowbite-svelte-icons';
	import { createEventDispatcher, onMount } from 'svelte';

	import { generateMrPromisesFromScope, glCurrentUser } from '$lib/gitlab';
	import { type MergeRequest, postProcess } from '$lib/mr';
	import type { Scope } from '$types/Scope';

	import Mr from './Mr.svelte';
	const dispatch = createEventDispatcher<{
		count: number;
	}>();

	export let scope: Scope;

	let mrPromises: Promise<MergeRequestSchemaWithBasicLabels[][]>;
	let mrs: MergeRequest[] = [];
	export const refresh = async (background: boolean) => {
		const currentuser = await glCurrentUser;
		mrPromises = background
			? Promise.resolve(await generateMrPromisesFromScope(scope, currentuser))
			: generateMrPromisesFromScope(scope, currentuser);
		mrPromises.then(async (value) => {
			mrs = await postProcess(scope, value);
			dispatch('count', mrs.length);
		});
	};

	onMount(() => {
		refresh(false);
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

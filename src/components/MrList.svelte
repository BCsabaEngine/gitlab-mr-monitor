<script lang="ts">
	import type { MergeRequestSchemaWithBasicLabels } from '@gitbeaker/rest';
	import { Indicator } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	import AppLoading from '$components/appStatusCards/AppLoading.svelte';
	import { getMrs } from '$lib/gitlab';

	import Mr from './Mr.svelte';

	let mrs: Promise<MergeRequestSchemaWithBasicLabels[]>;
	export const refresh = async (background: boolean) =>
		(mrs = background ? Promise.resolve(await getMrs()) : getMrs());

	onMount(() => {
		refresh(false);
	});
</script>

{#await mrs}
	<AppLoading
		lazyMs={750}
		title="Pending MRs"
		message="A few moments and we will see the merge requests..."
	/>
{:then mrs}
	{#if mrs && mrs.length > 0}
		<div class="container mx-auto mb-4">
			<h4
				class="mb-2 ml-2 text-lg flex items-center font-bold tracking-tight text-gray-900 dark:text-white"
			>
				<Indicator color="yellow" class="mr-2" />Foundation / BMS / FE
			</h4>
			<div class="mt-2 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each mrs as mr (mr.id)}
					<Mr {mr} />
				{/each}
			</div>
		</div>
	{/if}
{/await}

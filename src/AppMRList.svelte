<script lang="ts">
	import type { MergeRequestSchemaWithBasicLabels } from '@gitbeaker/rest';
	import { onMount } from 'svelte';

	import AppLoading from '$components/appStatusCards/AppLoading.svelte';
	import { getMrs } from '$lib/gitlab';

	let mrs: Promise<MergeRequestSchemaWithBasicLabels[]>;
	export const refresh = () => {
		mrs = getMrs();
	};
	onMount(() => {
		refresh();
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
		{#each mrs as mritem}
			<div class="ml-2 mt-1">{mritem.title}</div>
		{/each}
	{/if}
{/await}

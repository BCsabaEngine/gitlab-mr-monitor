<script lang="ts">
	import type { MergeRequestSchemaWithBasicLabels } from '@gitbeaker/rest';
	import { createEventDispatcher, onMount } from 'svelte';

	import AppLoading from '$components/appStatusCards/AppLoading.svelte';
	import { dummyScopes, getMrs } from '$lib/gitlab';
	import { type MergeRequest, postProcess } from '$lib/mr';

	//import { configurationStore, getConfigurationStoreValue } from '$stores/configStore';
	import Mr from './Mr.svelte';
	const dispatch = createEventDispatcher<{
		count: number;
	}>();

	let mrPromises: Promise<MergeRequestSchemaWithBasicLabels[][]>;
	let mrs: MergeRequest[] = [];
	export const refresh = async (background: boolean) => {
		mrPromises = background ? Promise.resolve(await getMrs()) : getMrs();
		mrPromises.then(async (value) => {
			//mrs = postProcess(getConfigurationStoreValue().scopes, value);
			mrs = await postProcess(dummyScopes, value);
			dispatch('count', mrs.length);
		});
	};

	onMount(() => {
		refresh(false);
	});
</script>

{#await mrPromises}
	<AppLoading
		lazyMs={750}
		title="Pending MRs"
		message="A few moments and we will see the merge requests..."
	/>
{:then}
	{#if mrs && mrs.length > 0}
		<div class="container mx-auto mb-4">
			<div class="mt-2 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each mrs as mr (mr.id)}
					<Mr {mr} />
				{/each}
			</div>
		</div>
	{/if}
{/await}

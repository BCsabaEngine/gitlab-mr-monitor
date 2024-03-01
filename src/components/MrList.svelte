<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	import { dummyScopes } from '$stores/configStore';
	import type { Scope } from '$types/Scope';

	import MrScope from './MrScope.svelte';
	const dispatch = createEventDispatcher<{
		count: number;
	}>();

	let scopes: Scope[] = [];
	let controls: MrScope[] = [];
	let sumCount = 0;
	export const refresh = async (background: boolean) => {
		sumCount = 0;
		for (const control of controls) await control.refresh(background);
	};

	onMount(() => {
		scopes = dummyScopes;
		controls = Array.from({ length: scopes.length });
	});

	const onCount = (count: number) => {
		sumCount += count;
		dispatch('count', sumCount);
	};
</script>

{#each scopes as scope, index}
	<MrScope bind:this={controls[index]} on:count={(count) => onCount(count.detail)} {scope} />
{/each}

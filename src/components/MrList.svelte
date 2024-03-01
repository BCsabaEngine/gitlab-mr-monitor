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
	let counts: number[] = [];
	export const refresh = async (background: boolean) => {
		for (const control of controls) await control.refresh(background);
	};

	onMount(() => {
		scopes = dummyScopes;
		controls = Array.from({ length: scopes.length });
		counts = Array.from({ length: scopes.length });
		counts.fill(0);
	});
</script>

{#each scopes as scope, index}
	<MrScope
		bind:this={controls[index]}
		on:count={(count) => {
			counts[index] = count.detail;
			dispatch(
				'count',
				counts.reduce((p, c) => p + c, 0)
			);
		}}
		{scope}
	/>
{/each}

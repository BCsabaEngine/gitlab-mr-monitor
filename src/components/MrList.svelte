<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	import { dummyScopes } from '$stores/configStore';
	import type { Scope } from '$types/Scope';

	import MrScope from './MrScope.svelte';
	const dispatch = createEventDispatcher<{
		count: number;
	}>();

	let lastRefreshIsBackground = false;
	let scopes: Scope[] = [];
	let controls: MrScope[] = [];
	let counts: number[] = [];
	let audio: HTMLAudioElement;
	export const refresh = async (background: boolean) => {
		lastRefreshIsBackground = background;
		for (const control of controls) await control.refresh(background);
	};

	let lastNotificationPlayedAt = Date.now();
	const playNotification = () => {
		if (!lastRefreshIsBackground) return;
		if (Date.now() - lastNotificationPlayedAt < 1000) return;

		audio.play();
		lastNotificationPlayedAt = Date.now();
	};

	onMount(() => {
		scopes = dummyScopes;
		controls = Array.from({ length: scopes.length });
		counts = Array.from({ length: scopes.length });
		counts.fill(0);
	});
</script>

<audio src="./notification.mp3" bind:this={audio}></audio>

{#each scopes as scope, index}
	<MrScope
		bind:this={controls[index]}
		on:count={(count) => {
			if (counts[index] < count.detail) playNotification();
			counts[index] = count.detail;
			dispatch(
				'count',
				counts.reduce((p, c) => p + c, 0)
			);
		}}
		{scope}
	/>
{/each}

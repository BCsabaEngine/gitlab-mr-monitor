<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	import { configurationStore } from '$stores/configurationStore';
	import type { Scope } from '$types/Scope';

	import MrScope from './MrScope.svelte';
	const dispatch = createEventDispatcher<{
		count: number;
		changed: void;
	}>();

	let lastRefreshIsBackground = false;
	let refreshSessionId = 0;
	let refreshSessionIdAlertPlayed = 0;

	let scopes: Scope[] = [];
	let controls: MrScope[] = [];
	let counts: number[] = [];
	let audio: HTMLAudioElement;
	export const refresh = async (sessionId: number, background: boolean) => {
		lastRefreshIsBackground = background;
		refreshSessionId = sessionId;
		for (const control of controls) await control.refresh(sessionId, background);
	};

	let lastNotificationPlayedAt = Date.now();
	const playNotification = () => {
		if (!lastRefreshIsBackground) return;
		if (Date.now() - lastNotificationPlayedAt < 1000) return;

		audio.play();
		lastNotificationPlayedAt = Date.now();
	};

	onMount(() => {
		scopes = $configurationStore.scopes;
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
			if (count.detail.sessionId !== refreshSessionId) return;

			counts[index] = count.detail.count;
			dispatch(
				'count',
				counts.reduce((p, c) => p + c, 0)
			);
		}}
		on:alert={(alert) => {
			if (alert.detail.sessionId !== refreshSessionId) return;

			dispatch('changed');

			if (refreshSessionIdAlertPlayed !== alert.detail.sessionId) {
				playNotification();
				refreshSessionIdAlertPlayed !== alert.detail.sessionId;
			}
		}}
		{scope}
	/>
{/each}

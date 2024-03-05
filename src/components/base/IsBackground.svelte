<script lang="ts" context="module">
	import { get, writable } from 'svelte/store';

	export const isBackground = writable(false);
	export const isBackgroundNow = () => get(isBackground);
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		change: void;
		focus: void;
		background: void;
	}>();
</script>

<svelte:window
	on:focus={() => {
		isBackground.set(false);
		dispatch('change');
		dispatch('focus');
	}}
	on:blur={() => {
		isBackground.set(true);
		dispatch('background');
	}}
/>

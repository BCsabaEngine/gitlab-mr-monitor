<script lang="ts">
	import { Spinner } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	export let title: string;
	export let message: string;
	export let lazyMs: number = 0;

	let visible = false;

	onMount(() => {
		if (lazyMs)
			setTimeout(() => {
				visible = true;
			}, lazyMs);
		else visible = true;
	});
</script>

{#if visible}
	<div class="flex justify-center mt-9">
		<center>
			<h5 class="mb-2 text-2xl font-bold tracking-tight text-primary-600 dark:text-white">
				{title}
			</h5>
			<p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
				{message}
			</p>
			<Spinner class="mt-4" />
		</center>
	</div>
{/if}

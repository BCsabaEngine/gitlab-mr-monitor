<script>
	import { Button, Card } from 'flowbite-svelte';

	import { openConfiguration } from '$lib/openConfiguration';
</script>

<div class="flex justify-center mt-9">
	<Card>
		<center>
			<h5 class="mb-2 text-2xl font-bold tracking-tight text-primary-600 dark:text-white">
				We can't start yet
			</h5>
			<p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
				You need to set up access to the Gitlab server before we can proceed.
			</p>
			<br />
			<Button color="primary" on:click={() => openConfiguration()}>Open settings</Button>
		</center>
	</Card>
</div>

<script lang="ts">
	import { Button, Card } from 'flowbite-svelte';

	export let message: string;
</script>

<div class="flex justify-center mt-9">
	<Card>
		<center>
			<h5 class="mb-2 text-2xl font-bold tracking-tight text-red-600 dark:text-white">
				Oops, something happened
			</h5>
			<p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
				{message}
			</p>
			<br />
			<Button color="red">Open settings</Button>
		</center>
	</Card>
</div>

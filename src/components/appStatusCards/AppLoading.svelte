<script>
	import { Card } from 'flowbite-svelte';
	import { SyncLoader } from 'svelte-loading-spinners';
</script>

<div class="flex justify-center mt-9">
	<Card>
		<center>
			<h5 class="mb-2 text-2xl font-bold tracking-tight text-primary-600 dark:text-white">
				Init Gitlab environment
			</h5>
			<p class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
				Now we query the groups, users and projects. We ask for your patience...
			</p>
			<SyncLoader color="green" />
		</center>
	</Card>
</div>

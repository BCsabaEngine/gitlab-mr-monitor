<script lang="ts">
	import { Button, Input, Label, Modal } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import AutoFocus from '$components/modal/util/AutoFocus.svelte';
	import type { Configuration } from '$types/Configuration';

	const dispatch = createEventDispatcher<{
		resolve: {
			trigger: 'custom';
			confirmed: boolean;
			configuration: Configuration;
		};
	}>();
	const resolve = (confirmed: boolean) =>
		dispatch('resolve', {
			trigger: 'custom',
			confirmed,
			configuration
		});

	export let configuration: Configuration;
</script>

<Modal open={true} size="lg" dismissable={false} bodyClass="space-y-0">
	<AutoFocus />
	<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Configuration</h3>
	<div class="flex flex-col space-y-6">
		<div>
			<Label for="name" class="mb-2">Name</Label>
			<Input id="name" bind:value={configuration.gitlab.host} />
		</div>
	</div>
	<div class="text-center mt-4 space-y-6">
		<Button on:click={() => resolve(true)} color="green" class="me-2">OK</Button>
		<Button on:click={() => resolve(false)} color="alternative" class="me-2">Cancel</Button>
	</div>
</Modal>

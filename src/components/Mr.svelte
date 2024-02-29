<script lang="ts">
	import { Card, Tooltip } from 'flowbite-svelte';
	import { Toolbar, ToolbarButton, ToolbarGroup } from 'flowbite-svelte';
	import { EnvelopeOutline, ImageOutline } from 'flowbite-svelte-icons';

	import type { MergeRequest } from '$lib/mr';

	export let mr: MergeRequest;
</script>

<Card class="max-w-full min-h-32 max-h-52 flex flex-col sm:p-0 sm:px-6 sm:pb-6">
	<Toolbar class="px-0 pb-0">
		{#await mr.project}
			...
		{:then project}
			{project.name}
		{/await}
		<ToolbarGroup slot="end">
			<ToolbarButton>Approve</ToolbarButton>
			<ToolbarButton><EnvelopeOutline class="w-6 h-6" /></ToolbarButton>
			<ToolbarButton><ImageOutline class="w-6 h-6 text-red-600" /></ToolbarButton>
		</ToolbarGroup>
	</Toolbar>
	<h5 class="mb-2 text-md font-bold tracking-tigh text-gray-900 dark:text-white">
		{mr.title}
	</h5>
	<p
		id={`description-${mr.id}`}
		class="my-2 truncate cursor-pointer text-sm font-normal text-gray-700 dark:text-gray-400 leading-tight whitespace-pre-line"
	>
		{mr.description}
	</p>
	<Tooltip
		trigger="click"
		triggeredBy={`#description-${mr.id}`}
		type="light"
		arrow={false}
		color="green"
		class="whitespace-pre-line">{mr.description}</Tooltip
	>
</Card>

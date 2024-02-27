<script lang="ts">
	import type { MergeRequestSchemaWithBasicLabels } from '@gitbeaker/rest';
	import { Badge, Card } from 'flowbite-svelte';
	import { Toolbar, ToolbarButton, ToolbarGroup } from 'flowbite-svelte';
	import { EnvelopeOutline, ImageOutline } from 'flowbite-svelte-icons';

	export let mr: MergeRequestSchemaWithBasicLabels;
</script>

<Card class="max-w-full min-h-40 flex flex-col sm:p-0 sm:px-6 sm:pb-6">
	<Toolbar class="px-0 pb-0">
		<ToolbarGroup>
			<ToolbarButton class="pl-0"><Badge>{mr.id}</Badge></ToolbarButton>
		</ToolbarGroup>
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
		class="mt-3 text-sm font-normal text-gray-700 dark:text-gray-400 leading-tight whitespace-pre-line"
	>
		{mr.description}
	</p>
</Card>

<script lang="ts">
	import { Avatar, Badge, Card, Tooltip } from 'flowbite-svelte';
	import { Toolbar, ToolbarGroup } from 'flowbite-svelte';
	import { InfoCircleOutline } from 'flowbite-svelte-icons';

	import type { MergeRequest } from '$lib/mr';

	export let mr: MergeRequest;
</script>

<Card class="max-w-full min-h-32 max-h-52 flex flex-col sm:p-0 sm:px-6 sm:pb-6">
	<Toolbar class="px-0 pb-0">
		<ToolbarGroup>
			{#await mr.project}
				...
			{:then project}
				<div>{project.name}</div>
				<Tooltip type="light" arrow={false} color="green">{project.name_with_namespace}</Tooltip>
			{/await}
		</ToolbarGroup>
		<ToolbarGroup slot="end">
			{#if mr.merge_status_human.status}
				<Badge
					color={mr.merge_status_human.level === 'error'
						? 'red'
						: mr.merge_status_human.level === 'warning'
							? 'yellow'
							: mr.merge_status_human.level === 'success'
								? 'green'
								: 'none'}
					class="mr-1">{mr.merge_status_human.status}</Badge
				>
			{/if}
			{#each mr.assignees || [] as assignee}
				<Avatar id="avatar-currentuser" size="xs" src={assignee.avatar_url} />
				<Tooltip type="light" arrow={false} color="green">{assignee.name} as assignee</Tooltip>
			{/each}
			{#each mr.reviewers || [] as reviewer}
				<Avatar id="avatar-currentuser" size="sm" src={reviewer.avatar_url} />
				<Tooltip type="light" arrow={false} color="green">{reviewer.name} as reviewer</Tooltip>
			{/each}
		</ToolbarGroup>
	</Toolbar>
	<h5 class="mt-2 mb-2 text-md font-bold tracking-tigh text-gray-900 dark:text-white">
		{#if mr.draft}
			<Badge color="yellow" class="mr-1">Draft</Badge>
		{/if}
		<a href={mr.web_url} target="_blank">{mr.title}</a>
		{#if mr.description}
			<span id={`description-${mr.id}`} class="text-primary-600 float-right mt-1">
				<InfoCircleOutline />
			</span>
			<Tooltip
				trigger="click"
				triggeredBy={`#description-${mr.id}`}
				type="light"
				arrow={false}
				color="green"
				class="whitespace-pre-line">{mr.description}</Tooltip
			>
		{/if}
	</h5>
	<div class="flex place-self-start text-sm mx-2">
		to
		{mr.target_branch}
		by
		{mr.author.name}
		{mr.updatedFromNow}
	</div>
	<div class="flex place-self-end">
		{#each mr.labels as label}
			<Badge color="dark" class="ml-1">{label}</Badge>
		{/each}
	</div>
</Card>

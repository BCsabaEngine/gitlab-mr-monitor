<script lang="ts">
	import { Avatar, Badge, Card, CloseButton, Tooltip } from 'flowbite-svelte';
	import { Toolbar, ToolbarGroup } from 'flowbite-svelte';
	import {
		ArrowRightOutline,
		ClockOutline,
		CodeBranchSolid,
		InfoCircleOutline,
		MessagesOutline,
		PlayOutline
	} from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';

	import { type MergeRequest, pipelineStatusToHuman } from '$lib/mr';

	const dispatch = createEventDispatcher<{
		close: number;
		confirmNew: number;
	}>();
	export let mr: MergeRequest;
	export let markedNew: boolean;
</script>

<Card
	color={markedNew ? 'green' : 'form'}
	class="max-w-full w-auto min-h-32 max-h-52 flex flex-col sm:p-0 sm:px-6 sm:pb-6 mx-2 md:mx-0"
	on:click={() => {
		dispatch('confirmNew', mr.id);
	}}
>
	<Toolbar color={markedNew ? 'green' : 'form'} class="px-0 pb-0">
		<ToolbarGroup>
			<CloseButton
				size="sm"
				on:click={() => {
					dispatch('close', mr.id);
				}}
			/>
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
			{#if mr.assignees && mr.assignees.length > 0}
				{#each mr.assignees || [] as assignee}
					<Avatar id="avatar-currentuser" size="xs" src={assignee.avatar_url} />
					<Tooltip type="light" placement="left" arrow={false} color="green"
						>{assignee.name} as assignee</Tooltip
					>
				{/each}
			{:else}
				<Avatar id="avatar-currentuser" size="xs" src={mr.author.avatar_url} />
				<Tooltip type="light" placement="left" arrow={false} color="green"
					>{mr.author.name} as author</Tooltip
				>
			{/if}
			{#each mr.reviewers || [] as reviewer}
				<Avatar id="avatar-currentuser" size="sm" src={reviewer.avatar_url} />
				<Tooltip type="light" placement="left" arrow={false} color="green"
					>{reviewer.name} as reviewer</Tooltip
				>
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
				placement="left"
				trigger="click"
				triggeredBy={`#description-${mr.id}`}
				type="light"
				arrow={false}
				color="green"
				class="whitespace-pre-line">{mr.description}</Tooltip
			>
		{/if}
	</h5>
	<div class="flex gap-1 text-sm mx-2">
		<CodeBranchSolid size="sm" class="mt-0.5" />
		{mr.source_branch}
		{#await mr.project}
			<ArrowRightOutline />
			{mr.target_branch}
		{:then project}
			{#if mr.target_branch !== project.default_branch}
				<ArrowRightOutline />
				{mr.target_branch}
			{/if}
		{/await}
	</div>
	<div class="flex gap-1 text-sm mx-2">
		<ClockOutline size="sm" class="mt-0.5" />
		{mr.updatedFromNow} ago
	</div>
	{#if mr.pipeline}
		<div class="flex gap-1 text-sm mx-2">
			<PlayOutline size="sm" class="mt-0.5" />
			{#await mr.pipeline}
				...
			{:then pipeline}
				{#if pipeline.length > 0}
					{@const plStatusHuman = pipelineStatusToHuman(pipeline[0].status)}
					<a href={pipeline[0].web_url} target="_blank">
						<span
							class={plStatusHuman.level === 'error'
								? 'text-red-600'
								: plStatusHuman.level === 'warning'
									? 'text-yellow-600'
									: plStatusHuman.level === 'success'
										? 'text-green-600'
										: ''}
						>
							{plStatusHuman.status}
						</span>
						pipeline
					</a>
				{:else}
					No pipeline
				{/if}
			{/await}
		</div>
	{/if}
	{#if mr.user_notes_count}
		<div class="flex gap-1 text-sm mx-2">
			<MessagesOutline size="sm" class="mt-0.5" />{mr.user_notes_count}
		</div>
	{/if}
	<div class="flex place-self-end">
		{#each mr.labels as label}
			<Badge color="dark" class="ml-1">{label}</Badge>
		{/each}
	</div>
</Card>

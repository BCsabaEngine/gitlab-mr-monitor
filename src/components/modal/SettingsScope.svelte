<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		Button,
		Card,
		Dropdown,
		Helper,
		Toggle
	} from 'flowbite-svelte';
	import { ArrowDownOutline, ArrowUpOutline, TrashBinSolid } from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';

	import NumberInputBound from '$components/base/input/NumberInputBound.svelte';
	import MultiSelect, { type MultiSelectItem } from '$components/base/MultiSelect.svelte';
	import Tag from '$components/base/Tag.svelte';
	import { glGroups, glProjects, glUsers } from '$lib/gitlab';
	import { showModalNameEdit } from '$stores/modalStore';
	import type { Scope } from '$types/Scope';

	const dispatch = createEventDispatcher<{
		moveUp: void;
		moveDown: void;
		delete: void;
	}>();
	export let scope: Scope;
	export let isFirst: boolean;
	export let isLast: boolean;
	export let allowDelete: boolean;

	const onNameEdit = async () => {
		const name = await showModalNameEdit(scope.name);
		if (name.confirmed && name.name) scope.name = name.name;
	};

	let userMapping: MultiSelectItem[] = [];
	// eslint-disable-next-line unicorn/prefer-top-level-await
	glUsers.then((users) => {
		userMapping = users.map((u) => ({
			id: u.id,
			label: `${u.name} (${u.username})`
		}));
	});

	let projectMapping: MultiSelectItem[] = [];
	// eslint-disable-next-line unicorn/prefer-top-level-await
	glProjects.then((projects) => {
		projectMapping = projects.map((p) => ({
			id: p.id,
			label: p.name,
			tooltip: p.name_with_namespace
		}));
	});

	let groupMapping: MultiSelectItem[] = [];
	// eslint-disable-next-line unicorn/prefer-top-level-await
	glGroups.then((groups) => {
		groupMapping = groups.map((g) => ({
			id: g.id,
			label: g.full_name
		}));
	});
</script>

<Card class="max-w-full flex flex-col my-2 p-0">
	<div class="flex flex-row justify-between">
		<div class="flex flex-row gap-2 my-1">
			{#if !isFirst}
				<Button size="xs" color="none" on:click={() => dispatch('moveUp')}>
					<ArrowUpOutline size="sm" class="mt-1 cursor-pointer" />
				</Button>
			{:else}
				<span class="w-4" />
			{/if}
			{#if !isLast}
				<Button size="xs" color="none" on:click={() => dispatch('moveDown')}>
					<ArrowDownOutline size="sm" class="mt-1 cursor-pointer" />
				</Button>
			{:else}
				<span class="w-4" />
			{/if}
			<Toggle size="small" bind:checked={scope.enabled}>On/Off</Toggle>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<span
				class="ml-2 text-md font-semibold tracking-tight text-gray-900 dark:text-white cursor-pointer"
				on:click={onNameEdit}
			>
				{scope.name}
			</span>
		</div>
		{#if scope.enabled}
			<div class="flex flex-row gap-8">
				<Button color="light" size="xs">Options</Button>
				<Dropdown class="w-60 p-3 space-y-1">
					<li>
						<Toggle class="p-2" size="small" bind:checked={scope.draft}>Display draft MRs</Toggle>
					</li>
					{#if 'hideMergeable' in scope}
						<li>
							<Toggle class="p-2 pt-4" size="small" bind:checked={scope.hideMergeable}
								>Hide mergeables</Toggle
							>
						</li>
					{/if}
					<li>
						<Toggle class="p-2 pt-4" size="small" bind:checked={scope.pipeline}
							>Query pipeline status</Toggle
						>
					</li>
					{#if 'alert' in scope}
						<li>
							<Toggle class="p-2 pt-4" size="small" bind:checked={scope.alert}
								>Play audio alert</Toggle
							>
						</li>
					{/if}
					{#if 'days' in scope}
						<li>
							<Helper class="ps-6x">How long to show MRs</Helper>
							<NumberInputBound
								class="ml-16 w-14"
								size="sm"
								metric="days"
								bind:value={scope.days}
								min={0}
								max={60}
							/>
						</li>
					{/if}
				</Dropdown>

				{#if allowDelete}
					<Button size="xs" color="none" on:click={() => dispatch('delete')}>
						<TrashBinSolid size="sm" class="my-2 cursor-pointer text-red-700" />
					</Button>
				{:else}
					<span class="w-4" />
				{/if}
			</div>
		{/if}
	</div>
	{#if scope.enabled}
		{@const multiselects =
			'groups' in scope || 'projects' in scope || 'onlyUsers' in scope || 'bannedWords' in scope}
		{#if multiselects}
			<Accordion flush>
				{#if 'groups' in scope && 'projects' in scope}
					<AccordionItem>
						<span slot="header" class="text-sm">
							{scope.groups.length > 0
								? `${scope.groups.length} groups selected`
								: 'No group selected'}
						</span>
						<Helper class="text-xs text-gray-600"
							>You must select one (or more) groups whose MRs are displayed in this scope. This
							group can also be the top level group. Don't select many groups, choose a higher level
							group instead!</Helper
						>
						<MultiSelect
							class="mt-2"
							items={groupMapping}
							bind:values={scope.groups}
							on:count={(event) => {
								if (event.detail > 0 && 'projects' in scope) scope.projects = [];
							}}
						/>
					</AccordionItem>
					<AccordionItem>
						<span slot="header" class="text-sm">
							{scope.projects.length > 0
								? `${scope.projects.length} projects selected`
								: 'No project selected'}
						</span>
						<Helper class="text-xs text-gray-600"
							>You must select one or more projects whose MRs are displayed in this scope. Don't
							select many projects, choose a group that they belong to!</Helper
						>
						<MultiSelect
							class="mt-2"
							items={projectMapping}
							bind:values={scope.projects}
							on:count={(event) => {
								if (event.detail > 0 && 'groups' in scope) scope.groups = [];
							}}
						/>
					</AccordionItem>
				{/if}

				{#if 'onlyUsers' in scope}
					<AccordionItem>
						<span slot="header" class="text-sm">
							{scope.onlyUsers.length > 0
								? `Only ${scope.onlyUsers.length} users' MRs are visible`
								: "Every user's MR is visible"}
						</span>
						<Helper class="text-xs text-gray-600"
							>You can set which users' MR you only want to see. It is useful if many of you work on
							a common repo with a small team.</Helper
						>
						<MultiSelect class="mt-2" items={userMapping} bind:values={scope.onlyUsers} />
					</AccordionItem>
				{/if}

				{#if 'bannedWords' in scope}
					<AccordionItem>
						<span slot="header" class="text-sm">
							{scope.bannedWords.length > 0
								? `${scope.bannedWords.length} banned words`
								: 'No banned word'}
						</span>
						<Helper class="text-xs text-gray-600"
							>You can select multiple words or word fragments and filter out MRs that contain those
							words.</Helper
						>
						<Tag
							class="mt-2"
							bind:values={scope.bannedWords}
							tagConverter={(tag) => (tag || '').trim().toLocaleLowerCase()}
						/>
					</AccordionItem>
				{/if}
			</Accordion>
		{/if}
	{/if}
</Card>

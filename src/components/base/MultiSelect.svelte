<script context="module" lang="ts">
	type Id = number;
	export type MultiSelectItem = {
		id: Id;
		label: string;
		tooltip?: string;
	};
</script>

<script lang="ts">
	import { Badge, Button, Dropdown, DropdownItem, Search, Tooltip } from 'flowbite-svelte';
	import {
		ChevronDownSolid,
		ClipboardOutline,
		CloseOutline,
		FileCopyOutline
	} from 'flowbite-svelte-icons';

	export let values: Id[];
	export let items: MultiSelectItem[];
	let aClass = '';
	export { aClass as class };

	let searchValue: string;
	let lookupItems: MultiSelectItem[];

	const add = (ids: Id | Id[]) => {
		if (!Array.isArray(ids)) ids = [ids];

		for (const id of ids) if (!values.includes(id)) values.push(id);

		values.sort((a, b) => {
			const sa = items.find((index) => index.id === a)?.label;
			const sb = items.find((index) => index.id === b)?.label;
			if (!sa || !sb) return 0;
			return sa.localeCompare(sb);
		});
		values = values;
	};

	const remove = (id: Id) => {
		const index = values.indexOf(id);
		if (index < 0) return;

		values.splice(index, 1);
		values = values;
	};

	const copy = () => navigator.clipboard.writeText(values.join(','));
	const paste = () =>
		navigator.clipboard.readText().then((value) =>
			value.split(',').map((v) => {
				if (Number(v) && items.some((index) => index.id === Number(v))) add(Number(v));
				const matchItems = items.filter((index) =>
					index.label.toLocaleLowerCase().includes(v.toLocaleLowerCase())
				);
				if (matchItems.length > 0) add(matchItems.map((mi) => mi.id));
			})
		);

	$: {
		const sv = (searchValue || '').toLocaleLowerCase().trim();

		const lis = (
			sv ? items.filter((index) => index.label.toLocaleLowerCase().includes(sv)) : items
		).filter((index) => !values.includes(index.id));
		lis.sort((a, b) => a.label.localeCompare(b.label));
		lookupItems = lis;
	}
</script>

<div class="flex flex-col gap-2 {aClass}">
	<div class="bt-4 flex flex-row gap-2">
		<Button size="xs">Add<ChevronDownSolid class="ml-2 text-white dark:text-white" /></Button>
		<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44 w-96">
			<div slot="header" class="p-3">
				<Search size="md" bind:value={searchValue} />
			</div>
			{#each lookupItems as li}
				<DropdownItem class="whitespace-nowrap" on:click={() => add(li.id)}>
					{li.label}
				</DropdownItem>
			{/each}
			<DropdownItem
				slot="footer"
				class="whitespace-nowrap"
				on:click={() => add(lookupItems.map((li) => li.id))}
			>
				Add all ({lookupItems.length})
			</DropdownItem>
		</Dropdown>

		<Button size="xs" outline color="light" on:click={() => copy()}>
			<FileCopyOutline class="mr-2" />Copy
		</Button>
		<Button size="xs" outline color="light" on:click={() => paste()}>
			<ClipboardOutline class="mr-2" />Paste
		</Button>
		<Button size="xs" outline color="light" class="ml-16" on:click={() => (values = [])}>
			<CloseOutline class="mr-2 text-red-700" />Clear
		</Button>
	</div>
	<div class="bt-4 flex flex-wrap gap-2">
		{#each values as value (value)}
			{#if items.some((index) => index.id === value)}
				<Badge dismissable on:close={() => remove(value)}
					>{items.find((index) => index.id === value)?.label}</Badge
				>
				{#if items.find((index) => index.id === value)?.tooltip}
					<Tooltip type="light">{items.find((index) => index.id === value)?.tooltip}</Tooltip>
				{/if}
			{/if}
		{/each}
	</div>
</div>

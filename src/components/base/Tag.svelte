<script context="module" lang="ts">
	export type TagConverter = (tag: string) => string;
</script>

<script lang="ts">
	import { Badge, Button, ButtonGroup, Input } from 'flowbite-svelte';
	import { ClipboardOutline, CloseOutline, FileCopyOutline } from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		count: number;
	}>();

	export let values: string[];
	let aClass = '';
	export { aClass as class };
	export let tagConverter: TagConverter | undefined;

	const add = (tags: string | string[]) => {
		if (!Array.isArray(tags)) tags = [tags];

		for (let tag of tags) {
			tag = tag.trim();
			if (tagConverter) tag = tagConverter(tag);
			if (tag && !values.includes(tag)) values.push(tag);
		}

		values.sort((a, b) => a.localeCompare(b));
		values = values;
		dispatch('count', values.length);
	};

	const remove = (tag: string) => {
		const index = values.indexOf(tag);
		if (index < 0) return;

		values.splice(index, 1);
		values = values;
		dispatch('count', values.length);
	};

	const copy = () => navigator.clipboard.writeText(values.join(','));
	const paste = () => navigator.clipboard.readText().then((value) => add(value.split(/, /i)));

	let inputValue: string = '';
	let input: Input;
	const addInputValue = () => {
		if (!inputValue) return;

		add(inputValue.split(/[ ,]/i));
		inputValue = '';
	};
	const onKeyPress = (event: KeyboardEvent) => {
		if (['Enter', 'Comma'].includes(event.code)) addInputValue();
	};
</script>

<div class="flex flex-col gap-2 {aClass}">
	<div class="bt-4 flex flex-row gap-2">
		<ButtonGroup>
			<Input
				id="tag"
				type="text"
				bind:this={input}
				bind:value={inputValue}
				on:keyup={onKeyPress}
				placeholder="new tag"
			/>
			<Button color="primary" on:click={() => addInputValue()}>Add</Button>
		</ButtonGroup>

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
			<Badge dismissable on:close={() => remove(value)}>{value}</Badge>
		{/each}
	</div>
</div>

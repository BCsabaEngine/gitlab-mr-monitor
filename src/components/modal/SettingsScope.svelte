<script lang="ts">
	import { Card, Toggle } from 'flowbite-svelte';
	import { ArrowDownOutline, ArrowUpOutline, TrashBinSolid } from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';

	import NumberInputBound from '$components/base/input/NumberInputBound.svelte';
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
</script>

<Card class="max-w-full flex flex-col mb-2 p-0">
	<div class="flex flex-row justify-between">
		<div class="flex flex-row gap-2 my-1">
			{#if !isFirst}
				<ArrowUpOutline size="sm" class="mt-1 cursor-pointer" on:click={() => dispatch('moveUp')} />
			{:else}
				<span class="w-4" />
			{/if}
			{#if !isLast}
				<ArrowDownOutline
					size="sm"
					class="mt-1 cursor-pointer"
					on:click={() => dispatch('moveDown')}
				/>
			{:else}
				<span class="w-4" />
			{/if}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<span
				class="ml-2 text-md font-semibold tracking-tight text-gray-900 dark:text-white cursor-pointer"
				on:click={onNameEdit}
			>
				{scope.name}
			</span>
		</div>
		<div class="flex flex-row gap-8">
			{#if 'days' in scope}
				<NumberInputBound
					class="w-14"
					size="sm"
					metric="days"
					bind:value={scope.days}
					min={0}
					max={60}
				/>
			{/if}
			{#if 'alert' in scope}
				<Toggle size="small" bind:checked={scope.alert}>Alert</Toggle>
			{/if}
			<Toggle size="small" bind:checked={scope.draft}>Draft</Toggle>
			{#if allowDelete}
				<TrashBinSolid
					size="sm"
					class="my-2 cursor-pointer text-red-700"
					on:click={() => dispatch('delete')}
				/>
			{:else}
				<span class="w-4" />
			{/if}
		</div>
	</div>
</Card>

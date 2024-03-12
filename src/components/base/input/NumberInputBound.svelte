<script lang="ts">
	import { ButtonGroup, InputAddon, NumberInput, Tooltip } from 'flowbite-svelte';

	export let id: string = 'numberInput';

	export let value: number;
	export let min: number | undefined;
	export let max: number | undefined;
	export let size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
	export let metric: string = '';

	let aClass = '';
	export { aClass as class };

	$: isError = () => (min && value < min) || (max && value > max) || false;
</script>

{#if metric}
	<ButtonGroup {size}>
		<NumberInput
			{id}
			bind:value
			on:blur={() => {
				if (min !== undefined && value < min) value = min;
				if (max !== undefined && value > max) value = max;
			}}
			class={aClass}
			{size}
			color={isError() ? 'red' : 'base'}
		/>
		<Tooltip type="light" placement="bottom-end">{min} - {max}</Tooltip>
		<InputAddon>{metric}</InputAddon>
	</ButtonGroup>
{:else}
	<NumberInput
		{id}
		bind:value
		on:blur={() => {
			if (min !== undefined && value < min) value = min;
			if (max !== undefined && value > max) value = max;
		}}
		class={aClass}
		{size}
		color={isError() ? 'red' : 'base'}
	/>
	<Tooltip type="light" placement="bottom-end">{min} - {max}</Tooltip>
{/if}

<script lang="ts">
	import { Button, Navbar, NavBrand, NavHamburger, NavUl, Toggle } from 'flowbite-svelte';
	import { CogOutline, RefreshOutline } from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';

	import { openConfiguration } from '$lib/openConfiguration';
	import { configurationMissing } from '$stores/configStore';

	const dispatch = createEventDispatcher<{
		refresh: void;
	}>();
</script>

<Navbar let:NavContainer color="none">
	<NavContainer class="border px-5 py-2 lg bg-white dark:bg-gray-600">
		<NavBrand href="/">
			<img src="/favicon.png" class="me-3 h-6 sm:h-9" alt="MR monitor" />
			<span class="self-center whitespace-nowrap text-xl font-semibold">MR monitor</span>
		</NavBrand>
		<NavHamburger />
		<NavUl>
			{#if !$configurationMissing}
				<Toggle>Drafts</Toggle>
				<Button size="md" on:click={() => dispatch('refresh')}
					><RefreshOutline class="mr-1" />Refresh</Button
				>
			{/if}
			<Button color="alternative" class="flex" size="md" on:click={() => openConfiguration()}
				><CogOutline class="mr-1" />Setting</Button
			>
		</NavUl>
	</NavContainer>
</Navbar>

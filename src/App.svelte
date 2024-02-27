<script lang="ts">
	import './app.postcss';
	import './App.css';

	import { ModalPortal } from '@svelte-put/modal';
	import { shortcut } from '@svelte-put/shortcut';
	import { Button, Kbd, Navbar, NavBrand, NavHamburger, NavUl, Toggle } from 'flowbite-svelte';
	import { CogOutline, RefreshOutline } from 'flowbite-svelte-icons';

	import AppConfigMissing from '$components/appStatusCards/AppConfigMissing.svelte';
	import { glInitial } from '$lib/gitlab';
	import { openConfiguration } from '$lib/openConfiguration';
	import { configurationMissing, configurationStore } from '$stores/configStore';
	import { modalStore } from '$stores/modalStore';

	import AppMrList from './AppMrList.svelte';
	import AppError from './components/appStatusCards/AppError.svelte';
	import AppLoading from './components/appStatusCards/AppLoading.svelte';

	let appMrList: AppMrList;

	let refreshButtonDisabled: boolean = false;
	const refreshMrList = async (background: boolean) => {
		refreshButtonDisabled = true;
		try {
			await appMrList.refresh(background);
		} finally {
			refreshButtonDisabled = false;
		}
	};
</script>

<svelte:window
	use:shortcut={{
		trigger: [
			{ key: 'r', modifier: [], callback: () => refreshMrList(false), preventDefault: true }
		]
	}}
/>

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
				<Button size="md" disabled={refreshButtonDisabled} on:click={() => refreshMrList(true)}
					><RefreshOutline class="mr-1" />Refresh <Kbd class="ml-2 px-2">R</Kbd></Button
				>
			{/if}
			<Button color="alternative" class="flex" size="md" on:click={() => openConfiguration()}
				><CogOutline class="mr-1" />Setting</Button
			>
		</NavUl>
	</NavContainer>
</Navbar>

{#key $configurationStore}
	{#if $configurationMissing}
		<AppConfigMissing />
	{:else}
		{#await glInitial}
			<AppLoading
				title="Init Gitlab environment"
				message="Now we query the groups, users and projects. We ask for your patience..."
			/>
		{:then}
			<AppMrList bind:this={appMrList} />
		{:catch error}
			<AppError
				message={(error && error.cause && error.cause.description) ||
					(error && error.message) ||
					error}
			/>
		{/await}
	{/if}
{/key}

<ModalPortal store={modalStore} />

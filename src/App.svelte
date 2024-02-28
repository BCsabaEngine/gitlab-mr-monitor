<script lang="ts">
	import './app.postcss';
	import './App.css';

	import { ModalPortal } from '@svelte-put/modal';
	import { shortcut } from '@svelte-put/shortcut';
	import {
		Avatar,
		Button,
		Kbd,
		Navbar,
		NavBrand,
		NavHamburger,
		NavUl,
		Tooltip
	} from 'flowbite-svelte';
	import { CogOutline, RefreshOutline } from 'flowbite-svelte-icons';

	import AppConfigMissing from '$components/appStatusCards/AppConfigMissing.svelte';
	import { glCurrentUser } from '$lib/gitlab';
	import { openConfiguration } from '$lib/openConfiguration';
	import { configurationMissing, configurationStore } from '$stores/configStore';
	import { modalStore } from '$stores/modalStore';

	import AppError from './components/appStatusCards/AppError.svelte';
	import AppLoading from './components/appStatusCards/AppLoading.svelte';
	import MrList from './components/MrList.svelte';

	let appMrList: MrList;

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
		trigger: [{ key: 'r', modifier: [], callback: () => refreshMrList(true), preventDefault: true }]
	}}
/>

<Navbar let:NavContainer color="none">
	<NavContainer class="border px-5 py-2 lg bg-white dark:bg-gray-600">
		<NavBrand href="/">
			<img src="/favicon.png" class="me-3 h-6 sm:h-9" alt="MR monitor" />
			<span class="self-center whitespace-nowrap text-xl font-semibold">MR monitor</span>
		</NavBrand>
		<div class="flex items-center md:order-2">
			<NavUl>
				{#if !$configurationMissing}
					<Button size="md" disabled={refreshButtonDisabled} on:click={() => refreshMrList(false)}
						><RefreshOutline class="mr-1" />Refresh <Kbd class="ml-2 px-2">R</Kbd></Button
					>
				{/if}
				<Button color="alternative" class="flex" size="md" on:click={() => openConfiguration()}
					><CogOutline class="mr-1" />Setting</Button
				>
			</NavUl>
			{#if !$configurationMissing}
				{#await glCurrentUser}
					<Avatar id="avatar-menu" />
				{:then glCurrentUser}
					<Avatar id="avatar-menu" src={glCurrentUser.avatar_url} />
					<Tooltip
						type="light"
						arrow={false}
						placement="bottom"
						color="green"
						class="whitespace-pre-line"
					>
						<b>{glCurrentUser.name}</b>
						<br />
						{glCurrentUser.email}</Tooltip
					>
				{/await}
			{/if}
			<NavHamburger class1="w-full md:flex md:w-auto md:order-1" />
		</div>
	</NavContainer>
</Navbar>

{#key $configurationStore}
	{#if $configurationMissing}
		<AppConfigMissing />
	{:else}
		{#await glCurrentUser}
			<AppLoading
				title="Init Gitlab environment"
				message="Now we query your identity. We ask for your patience..."
			/>
		{:then}
			<MrList bind:this={appMrList} />
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

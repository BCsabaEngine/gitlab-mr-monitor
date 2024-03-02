<script lang="ts">
	import './app.postcss';
	import './App.css';

	import { ModalPortal } from '@svelte-put/modal';
	import { shortcut } from '@svelte-put/shortcut';
	import {
		Avatar,
		Badge,
		Button,
		DarkMode,
		Dropdown,
		DropdownHeader,
		DropdownItem,
		Kbd,
		Navbar,
		NavHamburger,
		NavUl,
		Radio
	} from 'flowbite-svelte';
	import { CogOutline, ExclamationCircleOutline, RefreshOutline } from 'flowbite-svelte-icons';

	import AppConfigMissing from '$components/appStatusCards/AppLoginMissing.svelte';
	import { glCurrentUser } from '$lib/gitlab';
	import { configurationStore } from '$stores/configurationStore';
	import { loginMissing, resetLoginStoreValue } from '$stores/loginStore';
	import { modalStore } from '$stores/modalStore';
	import { userPreferencesStore } from '$stores/userPreferencesStore';

	import { openConfiguration } from './common/openConfiguration';
	import AppError from './components/appStatusCards/AppError.svelte';
	import AppLoading from './components/appStatusCards/AppLoading.svelte';
	import MrList from './components/MrList.svelte';

	let appMrList: MrList;
	let countMr: number = 0;

	let refreshButtonDisabled: boolean = false;
	let refreshSessionId = 0;
	const refreshMrList = async (background: boolean) => {
		if (!appMrList) return;
		refreshButtonDisabled = true;
		try {
			refreshSessionId++;
			await appMrList.refresh(refreshSessionId, background);
		} finally {
			refreshButtonDisabled = false;
		}
	};

	const autoRefreshList = [
		{ value: 0, name: 'Manual only' },
		{ value: 30, name: '30 seconds' },
		{ value: 60, name: '1 minute' },
		{ value: 2 * 60, name: '2 minutes' },
		{ value: 3 * 60, name: '3 minutes' },
		{ value: 5 * 60, name: '5 minutes' },
		{ value: 10 * 60, name: '10 minutes' },
		{ value: 15 * 60, name: '15 minutes' },
		{ value: 30 * 60, name: '30 minutes' }
	];
</script>

<svelte:window
	use:shortcut={{
		trigger: [{ key: 'r', modifier: [], callback: () => refreshMrList(true), preventDefault: true }]
	}}
/>
<div class="bg-gray-200 dark:bg-gray-400 min-h-screen">
	<Navbar let:NavContainer color="none">
		<NavContainer class="border px-5 py-2 lg bg-white dark:bg-gray-600">
			<div class="flex items-left md:order-2">
				<img src="/favicon.png" class="me-3 h-6 sm:h-9" alt="MR monitor" />
				<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
					>Gitlab MR monitor</span
				>
				{#if countMr > 0 && !$loginMissing}
					<Badge large border class="ml-4" color={countMr > 100 ? 'red' : 'green'}>
						{#if countMr > 10}
							<ExclamationCircleOutline class="mr-2" />
						{/if}
						<span class="text-lg">{countMr}</span></Badge
					>
				{/if}
			</div>
			<div class="flex items-center md:order-3">
				<NavUl>
					{#if !$loginMissing}
						<Button size="md" disabled={refreshButtonDisabled} on:click={() => refreshMrList(false)}
							><RefreshOutline class="mr-1" />Refresh <Kbd class="ml-2 px-2">R</Kbd></Button
						>
						<Button color="alternative" class="flex" size="md" on:click={() => openConfiguration()}
							><CogOutline class="mr-1" />Settings</Button
						>
					{/if}
				</NavUl>

				<DarkMode size="sm" class="mr-2" />

				{#if !$loginMissing}
					{#await glCurrentUser}
						<Avatar id="avatar-currentuser" />
					{:then glCurrentUser}
						<Avatar id="avatar-currentuser" src={glCurrentUser.avatar_url} class="cursor-pointer" />
						<Dropdown placement="bottom" class="min-w-40">
							<DropdownHeader>
								<span class="block text-sm">{glCurrentUser.name}</span>
								<span class="block truncate text-sm font-medium">{glCurrentUser.username}</span>
							</DropdownHeader>
							<DropdownItem>Auto refresh...</DropdownItem>
							<Dropdown placement="left-start" class="w-44 p-3 space-y-3 text-sm">
								{#each autoRefreshList as autoRefresh}
									<li>
										<Radio
											name="groupAutoRefresh"
											value={autoRefresh.value}
											bind:group={$userPreferencesStore.autoRefreshSec}>{autoRefresh.name}</Radio
										>
									</li>
								{/each}
							</Dropdown>
							<DropdownItem on:click={() => openConfiguration()}>Settings</DropdownItem>
							<DropdownItem on:click={() => resetLoginStoreValue()}>Logout</DropdownItem>
						</Dropdown>
					{/await}
				{/if}

				<NavHamburger class1="w-full md:flex md:w-auto md:order-1" />
			</div>
		</NavContainer>
	</Navbar>

	{#key $configurationStore}
		{#if $loginMissing}
			<AppConfigMissing />
		{:else}
			{#await glCurrentUser}
				<AppLoading
					title="Init Gitlab environment"
					message="Now we query your identity. We ask for your patience..."
				/>
			{:then}
				<MrList bind:this={appMrList} on:count={(count) => (countMr = count.detail)} />
			{:catch error}
				<AppError
					message={(error && error.cause && error.cause.description) ||
						(error && error.message) ||
						error}
				/>
			{/await}
		{/if}
	{/key}
</div>

<ModalPortal store={modalStore} />

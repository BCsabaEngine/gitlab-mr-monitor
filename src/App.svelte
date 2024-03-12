<script lang="ts">
	import './app.postcss';
	import './App.css';

	import { ModalPortal } from '@svelte-put/modal';
	import { shortcut } from '@svelte-put/shortcut';
	import {
		A,
		Alert,
		Avatar,
		Badge,
		Button,
		Dropdown,
		DropdownHeader,
		DropdownItem,
		Kbd,
		Navbar,
		NavUl,
		Radio
	} from 'flowbite-svelte';
	import { ClipboardCheckOutline, CogOutline, RefreshOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	import AppError from '$components/appStatusCards/AppError.svelte';
	import AppLoading from '$components/appStatusCards/AppLoading.svelte';
	import AppConfigMissing from '$components/appStatusCards/AppLoginMissing.svelte';
	import IsBackground, { isBackground } from '$components/base/IsBackground.svelte';
	import MrList from '$components/MrList.svelte';
	import { autoRefreshList } from '$lib/autoRefresh';
	import { init as initDarkMode } from '$lib/darkMode';
	import { glCurrentUser } from '$lib/gitlab';
	import { configurationStore } from '$stores/configurationStore';
	import {
		hiddenIdsLength,
		resetHiddenIdsStoreValue,
		resetTodayHiddenIdsStoreValue,
		todayHiddenIdsStore
	} from '$stores/hiddenIds';
	import { loginMissing, resetLoginStoreValue } from '$stores/loginStore';
	import { modalStore } from '$stores/modalStore';
	import { refreshTimer } from '$stores/refreshTimerStore';
	import { userPreferencesStore } from '$stores/userPreferencesStore';

	import { openConfiguration } from './common/openConfiguration';

	/*global __PKG_VERSION__*/
	const PKG_VERSION = __PKG_VERSION__;
	/*global __BASE_URL__*/
	const BASE_URL = __BASE_URL__;

	let appMrList: MrList;
	let countMr: number = 0;
	let changedIndicator = false;
	let deletedAlertVisible = false;

	let refreshButtonDisabled: boolean = false;
	let refreshSessionId = 0;
	const refreshMrList = async (background: boolean) => {
		if (!appMrList) return;
		if (refreshButtonDisabled) return;

		refreshButtonDisabled = true;
		try {
			refreshSessionId++;
			await appMrList.refresh(refreshSessionId, background);
		} finally {
			refreshButtonDisabled = false;
		}
	};

	const setChanged = (state: boolean) => (changedIndicator = $isBackground && state);
	onMount(() => {
		initDarkMode();
		let timerHider: number;
		const subscribes = [
			refreshTimer.subscribe(() => refreshMrList(true)),
			todayHiddenIdsStore.subscribe(() => {
				deletedAlertVisible = true;
				clearTimeout(timerHider);
				timerHider = setTimeout(() => {
					deletedAlertVisible = false;
				}, 7 * 1000) as unknown as number;
			})
		];
		return () => subscribes.map((u) => u());
	});
</script>

<svelte:window
	use:shortcut={{
		trigger: [{ key: 'r', modifier: [], callback: () => refreshMrList(true), preventDefault: true }]
	}}
/>
<svelte:head>
	<title
		>{countMr > 0 ? `(${countMr}${changedIndicator ? '!' : ''}) - ` : ''}Gitlab MR monitor</title
	>
</svelte:head>
<IsBackground on:focus={() => setChanged(false)} />

<div class="bg-gray-200 dark:bg-gray-400 min-h-screen">
	<Navbar let:NavContainer color="none">
		<NavContainer class="border px-5 py-2 bg-white dark:bg-gray-600">
			<div class="flex items-left">
				<img
					src="{BASE_URL}/favicon.png"
					class="me-3 h-9"
					alt="Gitlab MR monitor"
					title={PKG_VERSION}
				/>
				<span
					class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
					title={PKG_VERSION}
				>
					Gitlab MR monitor
				</span>
				{#if countMr > 0 && !$loginMissing}
					<Badge large border class="ml-4" color="dark">
						<span class="text-lg">
							{countMr}
						</span>
					</Badge>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				{#if !$loginMissing}
					<Button
						size="md"
						class="px-3 sm:px-6"
						disabled={refreshButtonDisabled}
						on:click={() => refreshMrList(true)}
					>
						<RefreshOutline class="mr-0 sm:mr-1" />
						<div class="hidden sm:flex">
							Refresh
							<Kbd class="ml-2 px-2">R</Kbd>
						</div>
					</Button>
					<NavUl>
						<Button color="none" size="xs" on:click={() => openConfiguration()}>
							<CogOutline />
						</Button>
					</NavUl>
				{/if}

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
							{#if $hiddenIdsLength}
								{#if $todayHiddenIdsStore}
									<DropdownItem
										on:click={() => {
											resetTodayHiddenIdsStoreValue();
											refreshMrList(true);
										}}>Restore today hiddens ({$todayHiddenIdsStore})</DropdownItem
									>
								{/if}
								<DropdownItem
									on:click={() => {
										resetHiddenIdsStoreValue();
										refreshMrList(true);
									}}>Restore all hiddens ({$hiddenIdsLength})</DropdownItem
								>
							{/if}
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
							<DropdownItem>Dark mode...</DropdownItem>
							<Dropdown placement="left-start" class="w-44 p-3 space-y-3 text-sm">
								<li>
									<Radio
										name="groupDarkMode"
										value={'system'}
										bind:group={$userPreferencesStore.darkMode}>System</Radio
									>
								</li>
								<li>
									<Radio
										name="groupDarkMode"
										value={'light'}
										bind:group={$userPreferencesStore.darkMode}>Light</Radio
									>
								</li>
								<li>
									<Radio
										name="groupDarkMode"
										value={'dark'}
										bind:group={$userPreferencesStore.darkMode}>Dark</Radio
									>
								</li>
							</Dropdown>
							<DropdownItem on:click={() => openConfiguration()}>Settings</DropdownItem>
							<DropdownItem on:click={() => resetLoginStoreValue()}>Logout</DropdownItem>
						</Dropdown>
					{/await}
				{/if}
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
				{#if $todayHiddenIdsStore && deletedAlertVisible}
					<Alert color="primary" class="container mb-2 mx-auto w-fit">
						You deleted <span class="font-medium">{$todayHiddenIdsStore} items today</span>. Click <A
							on:click={() => {
								resetTodayHiddenIdsStoreValue();
								refreshMrList(true);
							}}>here</A
						> to reset them all.
					</Alert>
				{/if}
				<MrList
					bind:this={appMrList}
					on:count={(count) => (countMr = count.detail)}
					on:changed={() => setChanged(true)}
				/>
				{#if countMr === 0}
					<span class="flex flex-col items-center pt-20 text-lg text-primary-700 dark:text-white">
						<ClipboardCheckOutline class="w-20 h-20" />
						Nothing to do
					</span>
				{/if}
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

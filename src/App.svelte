<script lang="ts">
	import './app.postcss';
	import './App.css';

	import { ModalPortal } from '@svelte-put/modal';
	import { onMount } from 'svelte';

	import AppConfigMissing from '$components/appStatusCards/AppConfigMissing.svelte';
	import { glInitial } from '$lib/gitlab';
	import { configurationMissing, configurationStore } from '$stores/configStore';
	import { modalStore } from '$stores/modalStore';

	import AppMrList from './AppMRList.svelte';
	import AppNavigation from './AppNavigation.svelte';
	import AppError from './components/appStatusCards/AppError.svelte';
	import AppLoading from './components/appStatusCards/AppLoading.svelte';

	onMount(async () => {
		//const p = await glInitial;
		//const u = await glUsers;
	});
	let appMrList: AppMrList;
</script>

<AppNavigation on:refresh={() => appMrList.refresh()} />
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

<script lang="ts">
	import './app.postcss';
	import './App.css';

	import { ModalPortal } from '@svelte-put/modal';
	import { onMount } from 'svelte';

	import AppConfigMissing from '$components/appStatusCards/AppConfigMissing.svelte';
	import { glInitial } from '$lib/gitlab';
	import { configurationMissing, configurationStore } from '$stores/configStore';
	import { modalStore } from '$stores/modalStore';

	import AppNavigation from './AppNavigation.svelte';
	import AppError from './components/appStatusCards/AppError.svelte';
	import AppLoading from './components/appStatusCards/AppLoading.svelte';

	onMount(async () => {
		//const p = await glInitial;
		//const u = await glUsers;
	});
</script>

<AppNavigation />
{#key $configurationStore}
	{#if $configurationMissing}
		<AppConfigMissing />
	{:else}
		{#await glInitial}
			<AppLoading />
		{:then}
			XXX
		{:catch error}
			<AppError message={error.cause.description || error} />
		{/await}
	{/if}
{/key}

<ModalPortal store={modalStore} />

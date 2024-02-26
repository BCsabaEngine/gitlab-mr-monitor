<script lang="ts">
	import './app.postcss';
	import './App.css';

	import { ModalPortal } from '@svelte-put/modal';
	import { onMount } from 'svelte';

	import AppConfigMissing from '$components/appStatusCards/AppConfigMissing.svelte';
	import { glInitial } from '$lib/gitlab/initial';
	import { glUsers } from '$lib/gitlab/users';
	import { configurationMissing } from '$stores/configStore';
	import { modalStore } from '$stores/modalStore';

	import AppNavigation from './AppNavigation.svelte';
	import AppError from './components/appStatusCards/AppError.svelte';
	import AppLoading from './components/appStatusCards/AppLoading.svelte';

	onMount(async () => {
		const p = await glInitial;
		const u = await glUsers;
	});
</script>

<AppNavigation />
{#if $configurationMissing}
	<AppConfigMissing />
{:else}
	{#await glInitial}
		<AppLoading />
	{:then}
		XXX
	{:catch error}
		<AppError message={error} />
	{/await}
{/if}

<ModalPortal store={modalStore} />

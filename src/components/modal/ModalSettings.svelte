<script lang="ts">
	import {
		Badge,
		Button,
		Helper,
		Hr,
		Input,
		Label,
		Modal,
		Select,
		TabItem,
		Tabs,
		Toggle
	} from 'flowbite-svelte';
	import { CheckOutline } from 'flowbite-svelte-icons';
	import { createEventDispatcher, onMount } from 'svelte';

	import AppError from '$components/appStatusCards/AppError.svelte';
	import AppLoading from '$components/appStatusCards/AppLoading.svelte';
	import BadgeAutohide from '$components/base/BadgeAutohide.svelte';
	import AutoFocus from '$components/modal/util/AutoFocus.svelte';
	import { swap } from '$lib/array';
	import { checkGitlabConnection, glCurrentUser, glUsers } from '$lib/gitlab';
	import { showModalNameEdit } from '$stores/modalStore';
	import type { Configuration } from '$types/Configuration';
	import { GitlabAccess } from '$types/GitlabAccess';
	import type { Scope } from '$types/Scope';

	import SettingsScope from './SettingsScope.svelte';

	const dispatch = createEventDispatcher<{
		resolve: {
			trigger: 'custom';
			confirmed: boolean;
			configuration: Configuration;
		};
	}>();
	const resolve = (confirmed: boolean) =>
		dispatch('resolve', {
			trigger: 'custom',
			confirmed,
			configuration
		});
	type GitlabApiError = {
		cause: {
			description: string;
		};
		message: string;
	};

	let badgeErrorDisplay: BadgeAutohide;
	let checkConnectionInProgress: boolean = false;
	const checkConnection = async () => {
		checkConnectionInProgress = true;
		try {
			const checkConnectionResult = await checkGitlabConnection(
				configuration.gitlab.host,
				configuration.gitlab.token
			);
			badgeErrorDisplay.show(
				`It's OK! You are ${checkConnectionResult.user.name} (${checkConnectionResult.user.username}) and work on Gitlab${checkConnectionResult.server.enterprise ? ' enterprise' : ''} server v${checkConnectionResult.server.version}.`,
				false,
				3000
			);
		} catch (error_: unknown) {
			const error = error_ as GitlabApiError;
			badgeErrorDisplay.show(
				(error && error.cause && error.cause.description) || (error && error.message),
				true,
				3000
			);
		} finally {
			checkConnectionInProgress = false;
		}
	};
	let checkConnectionButtonEnabled: boolean = false;
	$: checkConnectionButtonEnabled = GitlabAccess.safeParse(configuration.gitlab).success;

	const scopeMove = (scope: Scope, moveUp: boolean) => {
		const index = configuration.scopes.indexOf(scope);
		if (index < 0) return;

		if (moveUp) {
			if (index > 0) configuration.scopes = swap(configuration.scopes, index, index - 1);
		} else {
			if (index < configuration.scopes.length - 1)
				configuration.scopes = swap(configuration.scopes, index, index + 1);
		}
	};

	const scopeDelete = (scope: Scope) => {
		const index = configuration.scopes.indexOf(scope);
		if (index < 0) return;

		configuration.scopes.splice(index, 1);
		configuration.scopes = configuration.scopes;
	};

	const addNewScope = async () => {
		const name = await showModalNameEdit('New scope');
		if (name.confirmed && name.name) {
			configuration.scopes.push({
				mode: 'project',
				projects: [],
				name: name.name,
				enabled: true,
				days: 7,
				draft: false,
				alert: true
			});
			configuration.scopes = configuration.scopes;
		}
	};

	const refreshSecList = [
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

	let userMapping: Map<number, string> = new Map<number, string>();
	glUsers.then((users) => {
		userMapping.clear();
		for (const user of users) userMapping.set(user.id, `${user.username} / ${user.name}`);
	});

	export let configuration: Configuration;
</script>

<Modal open={true} size="lg" dismissable={false} bodyClass="space-y-0 min-h-screen">
	{#await glUsers}
		<AppLoading
			title="Init Gitlab settings"
			message="Now we query some data. We ask for your patience..."
		/>
	{:then}
		<AutoFocus />
		<h3 class="mb-10 text-lg font-normal text-gray-500 dark:text-gray-400">Settings</h3>
		<Tabs style="underline" contentClass="p-4 rounded-lg mt-4">
			<TabItem open title="General">
				Ignored users
				<div class="grid gap-6 mb-6 mt-4">
					<Label>
						Global ignored users
						{#each configuration.ignoredUsers as ignored}
							<Badge>
								{userMapping.get(ignored)}
							</Badge>
						{/each}
					</Label>
				</div>

				Gitlab access
				<div class="grid gap-6 mb-6 mt-2 md:grid-cols-2">
					<div>
						<Label for="host" class="mb-2">Host</Label>
						<Input
							id="host"
							bind:value={configuration.gitlab.host}
							placeholder="https://gitlab.com/"
						/>
						<Helper class="text-xs text-gray-600 mt-1 ml-2"
							>You can set the public Gitlab or the URL of a self-installed instance</Helper
						>
					</div>
					<div>
						<Label for="host" class="mb-2">Token</Label>
						<Input
							id="host"
							bind:value={configuration.gitlab.token}
							placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
						/>
						<Helper class="text-xs text-gray-600 mt-1 ml-2"
							>Enter your private access token, which can be the same one you write in npmrc/yarnrc</Helper
						>
					</div>
				</div>
				<Button
					on:click={checkConnection}
					outline
					disabled={checkConnectionInProgress || !checkConnectionButtonEnabled}
					color="green"
					class="float-rightx mr-2 mt-2"><CheckOutline class="mr-2" /> Check connection</Button
				>
				<br />
				<BadgeAutohide bind:this={badgeErrorDisplay} class="mt-2" />

				<Hr />

				User preferences
				<div class="grid gap-6 mb-6 mt-4 md:grid-cols-3">
					<Label>
						Auto refresh
						<Select
							class="mt-2"
							items={refreshSecList}
							bind:value={configuration.autoRefreshSec}
							placeholder=""
						/>
					</Label>
				</div>
			</TabItem>

			<TabItem title="Scopes">
				<Button class="mb-2" size="sm" on:click={addNewScope}>New scope</Button>
				{#each configuration.scopes as scope, index}
					<SettingsScope
						{scope}
						isFirst={index === 0}
						isLast={index === configuration.scopes.length - 1}
						allowDelete={scope.mode === 'project'}
						on:moveUp={() => scopeMove(scope, true)}
						on:moveDown={() => scopeMove(scope, false)}
						on:delete={() => scopeDelete(scope)}
					/>
				{/each}
			</TabItem>
		</Tabs>

		<div class="absolute right-4 bottom-6">
			<Button
				on:click={() => resolve(true)}
				disabled={!checkConnectionButtonEnabled}
				color="green"
				class="me-2">OK</Button
			>
			<Button on:click={() => resolve(false)} color="alternative" class="me-2">Cancel</Button>
		</div>
	{:catch error}
		<AppError
			message={(error && error.cause && error.cause.description) ||
				(error && error.message) ||
				error}
		/>
	{/await}
</Modal>

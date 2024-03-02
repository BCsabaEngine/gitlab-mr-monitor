<script lang="ts">
	import { Badge, Button, Helper, Label, Modal, TabItem, Tabs } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import AppError from '$components/appStatusCards/AppError.svelte';
	import AppLoading from '$components/appStatusCards/AppLoading.svelte';
	import AutoFocus from '$components/modal/util/AutoFocus.svelte';
	import { swap } from '$lib/array';
	import { glUsers } from '$lib/gitlab';
	import { showModalNameEdit } from '$stores/modalStore';
	import type { Configuration } from '$types/Configuration';
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
			<TabItem
				open
				title={`Scopes ${configuration.scopes.length > 0 ? configuration.scopes.length : ''}`}
			>
				<Button class="mb-2" size="sm" on:click={addNewScope}>New scope</Button>
				<div class="flex flex-col h-64 overflow-y-auto">
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
				</div>
			</TabItem>

			<TabItem
				title={`Ignored users ${configuration.ignoredUsers.length > 0 ? configuration.ignoredUsers.length : ''}`}
			>
				<Helper ßclass="text-xs text-gray-600 mt-1 ml-2"
					>You can specify the system-level users whose MR you don't want to deal with. Eg: renovate
					bot or a CI bot</Helper
				>
				<div class="grid gap-6 mb-6 mt-4">
					<Label>
						{#each configuration.ignoredUsers as ignored}
							<Badge>
								{userMapping.get(ignored)}
							</Badge>
						{/each}
					</Label>
				</div>
			</TabItem>
		</Tabs>

		<div class="absolute right-4 bottom-6">
			<Button on:click={() => resolve(true)} color="green" class="me-2">OK</Button>
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
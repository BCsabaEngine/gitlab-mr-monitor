<script lang="ts">
	import { Button, Helper, Modal, TabItem, Tabs } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	import AppError from '$components/appStatusCards/AppError.svelte';
	import AppLoading from '$components/appStatusCards/AppLoading.svelte';
	import MultiSelect, { type MultiSelectItem } from '$components/base/MultiSelect.svelte';
	import AutoFocus from '$components/modal/util/AutoFocus.svelte';
	import { swap } from '$lib/array';
	import { glGroups, glProjects, glUsers } from '$lib/gitlab';
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
				name: name.name,
				enabled: true,

				projects: [],
				groups: [],
				onlyUsers: [],
				days: 7,

				draft: false,
				hideMergeable: false,
				alert: true,
				pipeline: false
			});
			configuration.scopes = configuration.scopes;
		}
	};

	let userMapping: MultiSelectItem[] = [];
	// eslint-disable-next-line unicorn/prefer-top-level-await
	glUsers.then((users) => {
		userMapping = users.map((u) => ({
			id: u.id,
			label: `${u.name} (${u.username})`
		}));
	});

	export let configuration: Configuration;
</script>

<Modal open={true} size="lg" dismissable={false} bodyClass="space-y-0 min-h-96">
	{#await Promise.all([glUsers, glProjects, glGroups])}
		<AppLoading
			title="Init Gitlab settings"
			message="Now we query the groups, projects and users. We ask for your patience..."
		/>
	{:then}
		<AutoFocus />
		<h3 class="mb-10 text-lg font-normal text-gray-500 dark:text-gray-400">Settings</h3>
		<div class="float-right">
			<Button on:click={() => resolve(true)} color="green" class="me-2">OK</Button>
			<Button on:click={() => resolve(false)} color="alternative" class="me-2">Cancel</Button>
		</div>
		<Tabs style="underline" contentClass="p-4 rounded-lg mt-4 min-h-80 overflow-y-auto">
			<TabItem
				open
				title={`Scopes ${configuration.scopes.length > 0 ? configuration.scopes.length : ''}`}
			>
				<Button class="mb-2" size="sm" on:click={addNewScope}>New scope</Button>
				<div class="flex flex-col">
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
				<Helper class="text-xs text-gray-600 mt-1 ml-2"
					>You can specify the system-level users whose MR you don't want to deal with. Eg: renovate
					bot or a CI bot.</Helper
				>
				<MultiSelect class="mt-2" items={userMapping} bind:values={configuration.ignoredUsers} />
			</TabItem>
		</Tabs>
	{:catch error}
		<AppError
			message={(error && error.cause && error.cause.description) ||
				(error && error.message) ||
				error}
		/>
	{/await}
</Modal>

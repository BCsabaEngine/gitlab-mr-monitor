<script lang="ts">
	import { Button, Helper, Input, Label, Modal, TabItem, Tabs } from 'flowbite-svelte';
	import { CheckOutline } from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';

	import BadgeAutohide from '$components/base/BadgeAutohide.svelte';
	import AutoFocus from '$components/modal/util/AutoFocus.svelte';
	import { checkGitlabConnection } from '$lib/gitlab';
	import type { Configuration } from '$types/Configuration';

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
	let checkConnectionButtonDisabled: boolean = false;
	const checkConnection = async () => {
		checkConnectionButtonDisabled = true;
		try {
			await checkGitlabConnection(configuration.gitlab.host, configuration.gitlab.token);
			badgeErrorDisplay.show('Connection OK', false);
		} catch (error_: unknown) {
			const error = error_ as GitlabApiError;
			badgeErrorDisplay.show(
				(error && error.cause && error.cause.description) || (error && error.message),
				true
			);
		} finally {
			checkConnectionButtonDisabled = false;
		}
	};

	export let configuration: Configuration;
</script>

<Modal open={true} size="lg" dismissable={false} bodyClass="space-y-0 min-h-screen">
	<AutoFocus />
	<h3 class="mb-10 text-lg font-normal text-gray-500 dark:text-gray-400">Configuration</h3>
	<Tabs style="underline" contentClass="p-4 rounded-lg mt-4">
		<TabItem open title="Gitlab access">
			<div class="flex flex-col space-y-6">
				<div>
					<Label for="host" class="mb-2">Host</Label>
					<Input
						id="host"
						bind:value={configuration.gitlab.host}
						placeholder="https://gitlab.com/"
					/>
					<Helper class="text-sm text-gray-600 mt-1 ml-4"
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
					<Helper class="text-sm text-gray-600 mt-1 ml-4"
						>Enter your private access token, which can be the same one you write in npmrc/yarnrc</Helper
					>
				</div>
			</div>
			<br />
			<Button
				on:click={checkConnection}
				outline
				disabled={checkConnectionButtonDisabled}
				color="green"
				class="float-rightx mr-2"><CheckOutline class="mr-2" /> Check connection</Button
			>
			<BadgeAutohide bind:this={badgeErrorDisplay} />
		</TabItem>
		<TabItem title="Dashboard">
			<p class="text-sm text-gray-500 dark:text-gray-400">
				<b>Dashboard:</b>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua.
			</p>
		</TabItem>
	</Tabs>
	<div class="absolute right-4 bottom-6">
		<Button on:click={() => resolve(true)} color="green" class="me-2">OK</Button>
		<Button on:click={() => resolve(false)} color="alternative" class="me-2">Cancel</Button>
	</div>
</Modal>

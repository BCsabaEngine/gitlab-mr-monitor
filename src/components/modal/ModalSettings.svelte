<script lang="ts">
	import { Button, Helper, Input, Label, Modal, TabItem, Tabs } from 'flowbite-svelte';
	import { CheckOutline } from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';

	import BadgeAutohide from '$components/base/BadgeAutohide.svelte';
	import AutoFocus from '$components/modal/util/AutoFocus.svelte';
	import { checkGitlabConnection } from '$lib/gitlab';
	import type { Configuration } from '$types/Configuration';
	import { GitlabAccess } from '$types/GitlabAccess';

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

	export let configuration: Configuration;
</script>

<Modal open={true} size="lg" dismissable={false} bodyClass="space-y-0 min-h-screen">
	<AutoFocus />
	<h3 class="mb-10 text-lg font-normal text-gray-500 dark:text-gray-400">Settings</h3>
	<Tabs style="underline" contentClass="p-4 rounded-lg mt-4">
		<TabItem open title="Gitlab access">
			<div class="grid gap-6 mb-6 md:grid-cols-2">
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
		<Button
			on:click={() => resolve(true)}
			disabled={!checkConnectionButtonEnabled}
			color="green"
			class="me-2">OK</Button
		>
		<Button on:click={() => resolve(false)} color="alternative" class="me-2">Cancel</Button>
	</div>
</Modal>

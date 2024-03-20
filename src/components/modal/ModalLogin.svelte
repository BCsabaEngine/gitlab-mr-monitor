<script lang="ts">
	import { Button, ButtonGroup, Helper, Input, InputAddon, Label, Modal } from 'flowbite-svelte';
	import { CheckOutline, EyeOutline, EyeSlashOutline } from 'flowbite-svelte-icons';
	import { createEventDispatcher } from 'svelte';

	import BadgeAutohide from '$components/base/BadgeAutohide.svelte';
	import AutoFocus from '$components/modal/util/AutoFocus.svelte';
	import { checkGitlabConnection } from '$lib/gitlab';
	import { Login } from '$types/Login';

	const dispatch = createEventDispatcher<{
		resolve: {
			trigger: 'custom';
			confirmed: boolean;
			login: Login;
		};
	}>();
	const resolve = (confirmed: boolean) =>
		dispatch('resolve', {
			trigger: 'custom',
			confirmed,
			login
		});
	type GitlabApiError = {
		cause: {
			description: string;
		};
		message: string;
	};

	let badgeErrorDisplay: BadgeAutohide;
	let checkInProgress: boolean = false;
	const checkConnection = async () => {
		checkInProgress = true;
		try {
			const checkResult = await checkGitlabConnection(login.host, login.token);
			badgeErrorDisplay.show(
				`It's OK! You are ${checkResult.user.name} (${checkResult.user.username}) and work on Gitlab${checkResult.server.enterprise ? ' enterprise' : ''} server v${checkResult.server.version}.`,
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
			checkInProgress = false;
		}
	};
	let checkButtonEnabled: boolean = false;
	$: checkButtonEnabled = Login.safeParse(login).success;
	let showToken = false;
	export let login: Login;
</script>

<Modal open={true} size="sm" dismissable={false} bodyClass="space-y-0">
	<AutoFocus />
	<h3 class="mb-10 text-lg font-normal text-gray-500 dark:text-gray-400">Login to Gitlab server</h3>

	<div class="flex flex-col gap-4 py-6">
		<div>
			<Label for="host" class="mb-2">Host</Label>
			<Input id="host" bind:value={login.host} placeholder="https://gitlab.com/" />
			<Helper class="text-xs text-gray-600 mt-1 ml-2"
				>You can set the public Gitlab or the URL of a self-installed instance</Helper
			>
		</div>
		<div>
			<Label for="token" class="mb-2">Token</Label>

			<ButtonGroup class="w-full">
				<InputAddon>
					<button on:click={() => (showToken = !showToken)}>
						{#if showToken}
							<EyeOutline class="w-6 h-6" />
						{:else}
							<EyeSlashOutline class="w-6 h-6" />
						{/if}
					</button>
				</InputAddon>
				<Input
					id="token"
					bind:value={login.token}
					type={showToken ? 'text' : 'password'}
					placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
				/>
			</ButtonGroup>
			<Helper class="text-xs text-gray-600 mt-1 ml-2"
				>Enter your private access token, which can be the same one you write in npmrc/yarnrc</Helper
			>
		</div>
	</div>

	<div class="flex flex-row gap-4">
		<Button
			on:click={checkConnection}
			outline
			disabled={checkInProgress || !checkButtonEnabled}
			color="green"
			class="my-2"><CheckOutline class="mr-2" />Check</Button
		>
		<BadgeAutohide bind:this={badgeErrorDisplay} class="my-4" />
	</div>

	<div class="flex flex-row-reverse gap-2">
		<Button on:click={() => resolve(false)} color="alternative">Cancel</Button>
		<Button on:click={() => resolve(true)} disabled={!checkButtonEnabled} color="green">OK</Button>
	</div>
</Modal>

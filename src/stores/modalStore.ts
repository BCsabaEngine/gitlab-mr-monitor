import { createModalStore } from '@svelte-put/modal';

import ModalConfiguration from '$components/modal/ModalConfiguration.svelte';
import ModalConfirm from '$components/modal/ModalConfirm.svelte';
import ModalLogin from '$components/modal/ModalLogin.svelte';
import ModalNameEdit from '$components/modal/ModalNameEdit.svelte';
import type { Configuration } from '$types/Configuration';
import type { Login } from '$types/Login';

export const modalStore = createModalStore();

export const showModalConfirm = async (title: string): Promise<{ confirmed: boolean }> =>
	await modalStore
		.push({
			component: ModalConfirm,
			props: {
				title
			}
		})
		.resolve();

export const showModalNameEdit = async (
	name: string
): Promise<{ confirmed: boolean; name: string }> =>
	await modalStore
		.push({
			component: ModalNameEdit,
			props: {
				name
			}
		})
		.resolve();

export const showModalLogin = async (login: Login): Promise<{ confirmed: boolean; login: Login }> =>
	await modalStore
		.push({
			component: ModalLogin,
			props: {
				login: login
			}
		})
		.resolve();

export const showModalConfiguration = async (
	configuration: Configuration
): Promise<{ confirmed: boolean; configuration: Configuration }> =>
	await modalStore
		.push({
			component: ModalConfiguration,
			props: {
				configuration
			}
		})
		.resolve();

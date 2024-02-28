import { createModalStore } from '@svelte-put/modal';

import ModalConfirm from '$components/modal/ModalConfirm.svelte';
import ModalNameEdit from '$components/modal/ModalNameEdit.svelte';
import ModalSettings from '$components/modal/ModalSettings.svelte';
import type { Configuration } from '$types/Configuration';

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

export const showModalConfiguration = async (
	configuration: Configuration
): Promise<{ confirmed: boolean; configuration: Configuration }> =>
	await modalStore
		.push({
			component: ModalSettings,
			props: {
				configuration
			}
		})
		.resolve();

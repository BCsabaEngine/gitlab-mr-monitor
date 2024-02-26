import { createModalStore } from '@svelte-put/modal';

import ModalConfiguration from '$components/modal/ModalConfiguration.svelte';
import ModalConfirm from '$components/modal/ModalConfirm.svelte';
import ModalNameEdit from '$components/modal/ModalNameEdit.svelte';
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
			component: ModalConfiguration,
			props: {
				configuration
			}
		})
		.resolve();

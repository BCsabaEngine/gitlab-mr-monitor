import { getConfigurationStoreValue, setConfigurationStoreValue } from '$stores/configStore';
import { showModalConfiguration } from '$stores/modalStore';

import { reloadInitial as reloadInitialGitlabData } from './gitlab';

export const openConfiguration = async () => {
	const config = structuredClone(getConfigurationStoreValue());
	const { confirmed, configuration } = await showModalConfiguration(config);
	if (confirmed) {
		setConfigurationStoreValue(configuration);
		reloadInitialGitlabData();
	}
};

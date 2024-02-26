import { getConfigurationStoreValue, setConfigurationStoreValue } from '$stores/configStore';
import { showModalConfiguration } from '$stores/modalStore';

export const openConfiguration = async () => {
	const config = getConfigurationStoreValue();
	const { confirmed, configuration } = await showModalConfiguration(config);
	if (confirmed) setConfigurationStoreValue(configuration);
};

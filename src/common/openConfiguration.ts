import { reloadInitial as reloadInitialGitlabData } from '$lib/gitlab';
import { getConfigurationStoreValue, setConfigurationStoreValue } from '$stores/configurationStore';
import { getLoginStoreValue, setLoginStoreValue } from '$stores/loginStore';
import { showModalConfiguration, showModalLogin } from '$stores/modalStore';

export const openLogin = async () => {
	const loginSource = structuredClone(getLoginStoreValue());
	const { confirmed, login } = await showModalLogin(loginSource);
	if (confirmed) {
		setLoginStoreValue(login);
		reloadInitialGitlabData();
	}
};

export const openConfiguration = async () => {
	const config = structuredClone(getConfigurationStoreValue());
	const { confirmed, configuration } = await showModalConfiguration(config);
	if (confirmed) {
		setConfigurationStoreValue(configuration);
		reloadInitialGitlabData();
	}
};

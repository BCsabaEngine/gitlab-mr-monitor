import { Gitlab } from '@gitbeaker/rest';

import { getConfigurationStoreValue } from '$stores/configStore';

export const checkGitlabConnection = (host: string, token: string) =>
	new Gitlab({ host, token }).Groups.all();

export const getGitlabClient = () => {
	const config = getConfigurationStoreValue();
	return new Gitlab({
		host: config.gitlab.host,
		token: config.gitlab.token
	});
};

export let glGroups = getGitlabClient().Groups.all({ showExpanded: false });
export let glUsers = getGitlabClient().Users.all({ active: true, showExpanded: false });
export let glInitial = Promise.all([glUsers, glGroups]);

export const reloadInitial = () => {
	glGroups = getGitlabClient().Groups.all({ showExpanded: false });
	glUsers = getGitlabClient().Users.all({ active: true, showExpanded: false });
	glInitial = Promise.all([glUsers, glGroups]);
};

export const getMrs = async () => {
	return await getGitlabClient().MergeRequests.all({
		/*projectId: 852,*/ state: 'opened',
		groupId: 45,
		createdAfter: '2024/02/01'
	});
};

export const getProjects = async () => {
	return await getGitlabClient().Projects.all({ idAfter: 831, idBefore: 833 });
};

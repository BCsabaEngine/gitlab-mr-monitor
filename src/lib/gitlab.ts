import { Gitlab } from '@gitbeaker/rest';
import pTime from 'p-time';

import { getConfigurationStoreValue } from '$stores/configStore';

export const checkGitlabConnection = async (host: string, token: string) => {
	const cli = new Gitlab({ host, token });
	const p1 = pTime(cli.Users.showCurrentUser.bind(cli))();
	const p2 = pTime(cli.Metadata.show.bind(cli))();
	await Promise.all([p1, p2]);
	return {
		user: await p1,
		server: await p2,
		time: Math.max(p1.time || 0, p2.time || 0)
	};
};

export const getGitlabClient = () => {
	const config = getConfigurationStoreValue();
	return new Gitlab({
		host: config.gitlab.host,
		token: config.gitlab.token
	});
};

//export const glGroups = getGitlabClient().Groups.all({ showExpanded: false });
//export const glUsers = getGitlabClient().Users.all({ active: true, showExpanded: false });

export let glCurrentUser = getGitlabClient().Users.showCurrentUser({ showExpanded: false });

export const reloadInitial = () => {
	glCurrentUser = getGitlabClient().Users.showCurrentUser({ showExpanded: false });
};

export const getMrs = async () => {
	return await getGitlabClient().MergeRequests.all({
		projectId: 852,
		state: 'opened',
		//groupId: 45,
		createdAfter: '2024/01/01'
	});
};

export const getProjects = async () => {
	return await getGitlabClient().Projects.all({ idAfter: 831, idBefore: 833 });
};

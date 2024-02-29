import {
	Gitlab,
	type MergeRequestSchemaWithBasicLabels,
	type ProjectSchema
} from '@gitbeaker/rest';
import pMap from 'p-map';
import pTime from 'p-time';

import { getConfigurationStoreValue } from '$stores/configStore';
import type { Scope } from '$types/Scope';

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

export const dummyScopes: Scope[] = [
	{
		mode: 'my',
		draft: true
	},
	{
		mode: 'project',
		project: '805',
		alert: false,
		days: 0,
		draft: false
	},
	{
		mode: 'project',
		project: '852',
		alert: false,
		days: 0,
		draft: false
	},
	{
		mode: 'project',
		project: '47',
		alert: false,
		days: 0,
		draft: false
	},
	{
		mode: 'project',
		project: '802',
		alert: false,
		days: 0,
		draft: false
	},
	{
		mode: 'project',
		project: '802',
		alert: false,
		days: 0,
		draft: false
	}
];

const getScopeMr = async (scope: Scope) => {
	switch (scope.mode) {
		case 'project': {
			return getGitlabClient().MergeRequests.all({
				projectId: scope.project,
				state: 'opened'
				//projectId: 852,
				//groupId: 45,
				//createdAfter: '2024/01/01'
			});
		}
		case 'group': {
			return getGitlabClient().MergeRequests.all({
				groupId: scope.group,
				state: 'opened'
			});
		}
		//My MRs
		default: {
			return getGitlabClient().MergeRequests.all({
				state: 'opened'
			});
		}
	}
};

export const getMrs = async (): Promise<MergeRequestSchemaWithBasicLabels[][]> =>
	pMap(dummyScopes, getScopeMr, { concurrency: 4 });

const projectCache: Map<number, Promise<ProjectSchema>> = new Map<number, Promise<ProjectSchema>>();
export const getProject = async (id: number): Promise<ProjectSchema> => {
	if (!projectCache.has(id)) {
		const project = new Promise<ProjectSchema>((resolve) =>
			setTimeout(
				() => {
					resolve(getGitlabClient().Projects.show(id));
				},
				Math.random() * 1500 + 500
			)
		);
		projectCache.set(id, project);
	}
	return projectCache.get(id)!;
};

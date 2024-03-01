import {
	type ExpandedUserSchema,
	Gitlab,
	type MergeRequestSchemaWithBasicLabels,
	type ProjectSchema
} from '@gitbeaker/rest';
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

export const getConfiguredGitlabClient = () => {
	const config = getConfigurationStoreValue();
	return new Gitlab({
		host: config.gitlab.host,
		token: config.gitlab.token
	});
};

const projectCache: Map<number, Promise<ProjectSchema>> = new Map<number, Promise<ProjectSchema>>();
export const getProject = async (id: number): Promise<ProjectSchema> => {
	if (!projectCache.has(id)) projectCache.set(id, getConfiguredGitlabClient().Projects.show(id));
	return projectCache.get(id)!;
};

//export const glGroups = getGitlabClient().Groups.all({ showExpanded: false });
//export const glUsers = getGitlabClient().Users.all({ active: true, showExpanded: false });

/* Once initialized promises */
export let glCurrentUser = getConfiguredGitlabClient().Users.showCurrentUser({
	showExpanded: false
});
export const reloadInitial = () => {
	glCurrentUser = getConfiguredGitlabClient().Users.showCurrentUser({ showExpanded: false });
};

export const generateMrPromisesFromScope = (
	scope: Scope,
	user: ExpandedUserSchema
): Promise<MergeRequestSchemaWithBasicLabels[]>[] => {
	let updatedAfter: string | undefined;
	if ('days' in scope && scope.days > 0) {
		const today = new Date();
		today.setDate(today.getDate() - scope.days);
		updatedAfter = today.toISOString();
	}

	switch (scope.mode) {
		case 'project':
			return scope.projects.map((p) =>
				getConfiguredGitlabClient().MergeRequests.all({
					projectId: p,
					state: 'opened',
					updatedAfter
				})
			);
		case 'self-author':
			return [
				getConfiguredGitlabClient().MergeRequests.all({
					state: 'opened'
				})
			];
		case 'self-reviewer':
			return [
				getConfiguredGitlabClient().MergeRequests.all({
					state: 'opened',
					reviewerId: user.id
				})
			];
	}
};

import {
	AccessLevel,
	type ExpandedUserSchema,
	Gitlab,
	type MergeRequestSchemaWithBasicLabels,
	type ProjectSchema
} from '@gitbeaker/rest';

import { getLoginStoreValue } from '$stores/loginStore';
import type { Scope } from '$types/Scope';

import { daysBeforeNow } from './date';

export const checkGitlabConnection = async (host: string, token: string) => {
	const cli = new Gitlab({ host, token });
	return {
		user: await cli.Users.showCurrentUser(),
		server: await cli.Metadata.show()
	};
};

export const getConfiguredGitlabClient = () => {
	const login = getLoginStoreValue();
	return new Gitlab({
		host: login.host,
		token: login.token
	});
};

const projectCache: Map<number, Promise<ProjectSchema>> = new Map<number, Promise<ProjectSchema>>();
export const getGlProject = async (id: number): Promise<ProjectSchema> => {
	if (!projectCache.has(id)) projectCache.set(id, getConfiguredGitlabClient().Projects.show(id));
	return projectCache.get(id)!;
};

export const getGlLastPipeline = (projectId: number, sha: string) =>
	getConfiguredGitlabClient().Pipelines.all(projectId, { showExpanded: false, sha });

/* Once initialized promises */
const getGlProjects = () =>
	getConfiguredGitlabClient().Projects.all({
		simple: true,
		statistics: false,
		membership: true,
		minAccessLevel: AccessLevel.DEVELOPER,
		withMergeRequestsEnabled: true,
		lastActivityAfter: daysBeforeNow(60).toISOString(),
		archived: false,
		showExpanded: false
	});
const getGlUsers = () =>
	getConfiguredGitlabClient().Users.all({ active: true, showExpanded: false });
const getGlCurrentUser = () =>
	getConfiguredGitlabClient().Users.showCurrentUser({ showExpanded: false });

export let glCurrentUser = getGlCurrentUser();
export let glUsers = getGlUsers();
export let glProjects = getGlProjects();
export const reloadInitial = () => {
	glCurrentUser = getGlCurrentUser();
	glUsers = getGlUsers();
	glProjects = getGlProjects();
};

export const generateMrPromisesFromScope = async (
	scope: Scope,
	user: ExpandedUserSchema
): Promise<MergeRequestSchemaWithBasicLabels[][]> => {
	let updatedAfter: string | undefined;
	if ('days' in scope && scope.days > 0) updatedAfter = daysBeforeNow(scope.days).toISOString();

	switch (scope.mode) {
		case 'project':
			return await Promise.all(
				scope.projects.map(async (p) =>
					getConfiguredGitlabClient().MergeRequests.all({
						projectId: p,
						state: 'opened',
						updatedAfter
					})
				)
			);
		case 'self-author':
			return [
				await getConfiguredGitlabClient().MergeRequests.all({
					state: 'opened'
				})
			];
		case 'self-reviewer':
			return [
				await getConfiguredGitlabClient().MergeRequests.all({
					state: 'opened',
					reviewerId: user.id
				})
			];
	}
};

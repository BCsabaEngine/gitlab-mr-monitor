import {
	type ExpandedUserSchema,
	Gitlab,
	type MergeRequestSchemaWithBasicLabels,
	type ProjectSchema
} from '@gitbeaker/rest';

import { getConfigurationStoreValue } from '$stores/configStore';
import type { Scope } from '$types/Scope';

export const checkGitlabConnection = async (host: string, token: string) => {
	const cli = new Gitlab({ host, token });
	return {
		user: await cli.Users.showCurrentUser(),
		server: await cli.Metadata.show()
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

export const generateMrPromisesFromScope = async (
	scope: Scope,
	user: ExpandedUserSchema
): Promise<MergeRequestSchemaWithBasicLabels[][]> => {
	let updatedAfter: string | undefined;
	if ('days' in scope && scope.days > 0) {
		const today = new Date();
		today.setDate(today.getDate() - scope.days);
		updatedAfter = today.toISOString();
	}

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

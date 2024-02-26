import { apiGitlab } from './gitlab';

export const getMrs = async () => {
	return await apiGitlab.MergeRequests.all({
		/*projectId: 852,*/ state: 'opened',
		groupId: 45,
		createdAfter: '2024/02/01'
	});
};

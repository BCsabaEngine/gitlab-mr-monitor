import { apiGitlab } from './gitlab';

export const getProjects = async () => {
	return await apiGitlab.Projects.all({ idAfter: 831, idBefore: 833 });
};

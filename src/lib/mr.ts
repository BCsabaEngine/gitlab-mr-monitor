import { type MergeRequestSchemaWithBasicLabels, type ProjectSchema } from '@gitbeaker/rest';

import type { Scope } from '$types/Scope';

import { getProject } from './gitlab';

export type LazyProjectSchema = Promise<ProjectSchema>;

export type MergeRequest = MergeRequestSchemaWithBasicLabels & {
	project: LazyProjectSchema;
};

export const postProcess = async (
	scopes: Scope[],
	mrs: MergeRequestSchemaWithBasicLabels[][]
): Promise<MergeRequest[]> => {
	const result: MergeRequest[] = [];

	if (scopes.length != mrs.length) return result;

	for (const [index, scope] of scopes.entries()) {
		const mrg = mrs[index];
		for (const mr of mrg) {
			if (result.some((m) => m.id === mr.id)) continue;
			if (mr.draft && 'draft' in scope && !scope.draft) continue;
			result.push({
				...mr,
				// eslint-disable-next-line unicorn/no-await-expression-member
				project: getProject(mr.project_id)
			});
		}
	}

	return result;
};

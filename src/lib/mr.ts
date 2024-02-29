import { type MergeRequestSchemaWithBasicLabels, type ProjectSchema } from '@gitbeaker/rest';

import type { Scope } from '$types/Scope';

import { getProject } from './gitlab';

export type LazyProjectSchema = Promise<ProjectSchema>;

export type MergeRequest = MergeRequestSchemaWithBasicLabels & {
	project: LazyProjectSchema;
	merge_status_human: MergeRequestStatusHuman;
};

export type MergeRequestStatusHuman = {
	status: string;
	level: 'none' | 'success' | 'warning' | 'error';
};
const statusToHuman = (
	status:
		| 'blocked_status'
		| 'broken_status'
		| 'checking'
		| 'unchecked'
		| 'ci_must_pass'
		| 'ci_still_running'
		| 'discussions_not_resolved'
		| 'draft_status'
		| 'external_status_checks'
		| 'mergeable'
		| 'not_approved'
		| 'not_open'
		| 'policies_denied'
		| 'jira_association_missing'
): MergeRequestStatusHuman => {
	switch (status) {
		case 'blocked_status':
			return { status: 'Blocked', level: 'warning' };
		case 'checking':
			return { status: 'Checking', level: 'warning' };
		case 'broken_status':
			return { status: 'Broken', level: 'error' };
		case 'ci_must_pass':
			return { status: 'CI error', level: 'error' };
		case 'ci_still_running':
			return { status: 'CI...', level: 'none' };
		case 'discussions_not_resolved':
			return { status: 'Discussions', level: 'warning' };
		case 'mergeable':
			return { status: 'Mergeable', level: 'success' };
		case 'not_approved':
			return { status: 'Need approve', level: 'warning' };
		case 'policies_denied':
			return { status: 'Policies', level: 'error' };
		case 'unchecked':
			return { status: 'Unchecked', level: 'none' };
	}
	return { status: '', level: 'none' };
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
			if (mr.draft && !scope.draft) continue;
			mr.title = mr.title.replace(/^draft:/i, '').trim();
			result.push({
				...mr,
				project: getProject(mr.project_id),
				merge_status_human: statusToHuman(mr.detailed_merge_status)
			});
		}
	}

	return result;
};

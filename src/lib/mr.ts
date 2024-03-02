import { type MergeRequestSchemaWithBasicLabels, type ProjectSchema } from '@gitbeaker/rest';
import dayjs from 'dayjs/esm';
import relativeTime from 'dayjs/esm/plugin/relativeTime';

import type { Scope } from '$types/Scope';

import { getProject } from './gitlab';

dayjs.extend(relativeTime);

export type LazyProjectSchema = Promise<ProjectSchema>;

export type MergeRequest = MergeRequestSchemaWithBasicLabels & {
	project: LazyProjectSchema;
	projectNameToSort?: string;
	merge_status_human: MergeRequestStatusHuman;
	createdFromNow: string;
	updatedFromNow: string;
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
		case 'checking':
			return { status: 'Checking', level: 'none' };
		case 'broken_status':
			return { status: 'Broken', level: 'error' };
		case 'ci_must_pass':
			return { status: 'CI error', level: 'error' };
		case 'ci_still_running':
			return { status: 'CI running', level: 'none' };
		case 'discussions_not_resolved':
			return { status: 'Discussions', level: 'warning' };
		case 'mergeable':
			return { status: 'Mergeable', level: 'success' };
		case 'policies_denied':
			return { status: 'Policies', level: 'error' };
	}
	return { status: '', level: 'none' };
};

export const postProcess = async (
	scope: Scope,
	mrs: MergeRequestSchemaWithBasicLabels[][]
): Promise<MergeRequest[]> => {
	const result: MergeRequest[] = [];

	for (const mrg of mrs)
		for (const mr of mrg) {
			if (mr.draft && !scope.draft) continue;
			if (result.some((m) => m.id === mr.id)) continue;
			result.push({
				...mr,
				title: mr.title.replace(/^draft:/i, '').trim(),
				project: getProject(mr.project_id),
				merge_status_human: statusToHuman(mr.detailed_merge_status),
				createdFromNow: dayjs().from(dayjs(mr.created_at), true),
				updatedFromNow: dayjs().from(dayjs(mr.updated_at), true)
			});
		}

	result.sort((a, b) => {
		let result = b.project_id - a.project_id;
		if (result === 0) result = b.iid - a.iid;
		return result;
	});

	return result;
};

export const sortByProjectAndTitle = (mrs: MergeRequest[]) =>
	Promise.all(mrs.map((m) => m.project)).then(async () => {
		for await (const mr of mrs) {
			const project = await mr.project;
			mr.projectNameToSort = project.name;
		}
		return mrs.sort((a, b) => {
			if (!a.projectNameToSort || !b.projectNameToSort) return 0;
			return (a.projectNameToSort! + a.title).localeCompare(b.projectNameToSort! + b.title);
		});
	});

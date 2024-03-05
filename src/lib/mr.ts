import {
	type ApprovalStateSchema,
	type MergeRequestSchemaWithBasicLabels,
	type PipelineSchema,
	type ProjectSchema
} from '@gitbeaker/rest';
import dayjs from 'dayjs/esm';
import relativeTime from 'dayjs/esm/plugin/relativeTime';

import { getConfigurationStoreValue } from '$stores/configurationStore';
import type { Scope } from '$types/Scope';

import { getGlLastPipeline, getGlProject } from './gitlab';
import { isMrHidden } from './hiddenMr';

dayjs.extend(relativeTime);

export type LazyProjectSchema = Promise<ProjectSchema>;
export type LazyPipelineSchema = Promise<PipelineSchema[]>;
export type LazyApprovalStateSchema = Promise<ApprovalStateSchema>;

export type MergeRequest = MergeRequestSchemaWithBasicLabels & {
	project: LazyProjectSchema;
	projectNameToSort?: string;
	merge_status_human: MergeRequestStatusHuman;
	pipeline?: LazyPipelineSchema;
	createdFromNow: string;
	updatedFromNow: string;
};

export type MergeRequestStatusHuman = {
	status: string;
	level: 'none' | 'success' | 'warning' | 'error';
};
const mrStatusToHuman = (
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

export type PipelineStatusHuman = MergeRequestStatusHuman;
export const pipelineStatusToHuman = (status: string): PipelineStatusHuman => {
	switch (status) {
		case 'created':
			return { status: 'Created', level: 'none' };
		case 'waiting_for_resource':
			return { status: 'Resource waiting', level: 'none' };
		case 'preparing':
			return { status: 'Preparing', level: 'none' };
		case 'pending':
			return { status: 'Pending', level: 'none' };
		case 'running':
			return { status: 'Running', level: 'none' };
		case 'success':
			return { status: 'Success', level: 'success' };
		case 'failed':
			return { status: 'Failed', level: 'error' };
		case 'canceled':
			return { status: 'Canceled', level: 'warning' };
		case 'skipped':
			return { status: 'Skipped', level: 'none' };
		case 'manual':
			return { status: 'Manual', level: 'none' };
		case 'scheduled':
			return { status: 'Scheduled', level: 'none' };
	}
	return { status, level: 'none' };
};

export const postProcess = async (
	scope: Scope,
	mrs: MergeRequestSchemaWithBasicLabels[][]
): Promise<MergeRequest[]> => {
	const ignoredUsers = getConfigurationStoreValue().ignoredUsers;
	const result: MergeRequest[] = [];

	for (const mrg of mrs)
		for (const mr of mrg) {
			if (isMrHidden(mr.id)) continue;
			if (mr.draft && !scope.draft) continue;
			if (result.some((m) => m.id === mr.id)) continue;

			if (ignoredUsers.includes(mr.author.id)) continue;

			if (
				'hideMergeable' in scope &&
				scope.hideMergeable &&
				mr.detailed_merge_status === 'mergeable'
			)
				continue;

			if (mr.assignee && ignoredUsers.includes(mr.assignee.id)) continue;
			if (mr.assignees)
				for (const assignee of mr.assignees) if (ignoredUsers.includes(assignee.id)) continue;

			if ('onlyUsers' in scope && scope.onlyUsers.length > 0) {
				let match = false;
				match ||= scope.onlyUsers.includes(mr.author.id);
				if (mr.assignee) match ||= scope.onlyUsers.includes(mr.assignee.id);
				if (mr.assignees)
					for (const assignee of mr.assignees) match ||= scope.onlyUsers.includes(assignee.id);
				if (!match) continue;
			}

			result.push({
				...mr,
				title: mr.title.replace(/^draft:/i, '').trim(),
				project: getGlProject(mr.project_id),
				pipeline: scope.pipeline ? getGlLastPipeline(mr.project_id, mr.sha) : undefined,
				merge_status_human: mrStatusToHuman(mr.detailed_merge_status),
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

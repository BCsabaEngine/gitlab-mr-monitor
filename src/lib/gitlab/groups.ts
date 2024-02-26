import type { GroupSchema } from '@gitbeaker/rest';

import { apiGitlab } from './gitlab';

export const glGroups: Promise<GroupSchema[]> = apiGitlab.Groups.all({ showExpanded: false });

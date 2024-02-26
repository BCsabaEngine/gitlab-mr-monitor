import type { UserSchema } from '@gitbeaker/rest';

import { apiGitlab } from './gitlab';

export const glUsers: Promise<UserSchema[]> = apiGitlab.Users.all({
	active: true,
	showExpanded: false
});

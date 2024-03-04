import { z } from 'zod';

export const BaseScope = z.object({
	name: z.string(),
	enabled: z.boolean(),
	draft: z.boolean().default(false),
	pipeline: z.boolean().default(false)
});

export const BaseAlertScope = z.intersection(
	BaseScope,
	z.object({
		alert: z.boolean().default(false)
	})
);

export const BaseDaysWindowScope = z.intersection(
	BaseScope,
	z.object({
		days: z.number().nonnegative()
	})
);

export const BaseAlertDaysWindowScope = z.intersection(
	BaseAlertScope,
	z.object({
		days: z.number().nonnegative()
	})
);

export const AuthorScope = z.intersection(
	BaseScope,
	z.object({
		mode: z.literal('self-author')
	})
);
export type AuthorScope = z.infer<typeof AuthorScope>;

export const ReviewerScope = z.intersection(
	BaseAlertScope,
	z.object({
		mode: z.literal('self-reviewer')
	})
);
export type ReviewerScope = z.infer<typeof ReviewerScope>;

export const ProjectScope = z.intersection(
	BaseAlertDaysWindowScope,
	z.object({
		mode: z.literal('project'),
		projects: z.array(z.number()).default([]),
		onlyUsers: z.array(z.number()).default([])
	})
);
export type ProjectScope = z.infer<typeof ProjectScope>;

export const Scope = z.union([AuthorScope, ReviewerScope, ProjectScope]);
export type Scope = z.infer<typeof Scope>;

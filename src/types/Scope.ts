import { z } from 'zod';

export const BaseScope = z.object({
	name: z.string(),
	draft: z.boolean().default(false)
});

export const BaseScopeEx = z.intersection(
	BaseScope,
	z.object({
		days: z.number().nonnegative(),
		alert: z.boolean().default(false)
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
	BaseScope,
	z.object({
		mode: z.literal('self-reviewer')
	})
);
export type ReviewerScope = z.infer<typeof ReviewerScope>;

export const ProjectScope = z.intersection(
	BaseScopeEx,
	z.object({
		mode: z.literal('project'),
		projects: z.array(z.string())
	})
);
export type ProjectScope = z.infer<typeof ProjectScope>;

export const Scope = z.union([AuthorScope, ReviewerScope, ProjectScope]);
export type Scope = z.infer<typeof Scope>;

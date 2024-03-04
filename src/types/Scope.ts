import { z } from 'zod';

export const AuthorScope = z.object({
	mode: z.literal('self-author'),
	name: z.string(),
	enabled: z.boolean(),

	draft: z.boolean().default(false),
	pipeline: z.boolean().default(false)
});
export type AuthorScope = z.infer<typeof AuthorScope>;

export const ReviewerScope = z.object({
	mode: z.literal('self-reviewer'),
	name: z.string(),
	enabled: z.boolean(),

	draft: z.boolean().default(false),
	pipeline: z.boolean().default(false),
	alert: z.boolean().default(false),
	groups: z.array(z.number()).default([]),
	projects: z.array(z.number()).default([])
});
export type ReviewerScope = z.infer<typeof ReviewerScope>;

export const ProjectScope = z.object({
	mode: z.literal('project'),
	name: z.string(),
	enabled: z.boolean(),

	draft: z.boolean().default(false),
	pipeline: z.boolean().default(false),
	alert: z.boolean().default(false),
	days: z.number().default(7),
	groups: z.array(z.number()).default([]),
	projects: z.array(z.number()).default([]),
	onlyUsers: z.array(z.number()).default([])
});
export type ProjectScope = z.infer<typeof ProjectScope>;

export const Scope = z.union([AuthorScope, ReviewerScope, ProjectScope]);
export type Scope = z.infer<typeof Scope>;

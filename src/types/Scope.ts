import { z } from 'zod';

export const DraftScope = z.object({
	draft: z.boolean().default(false)
});

export const BaseScope = z.intersection(
	DraftScope,
	z.object({
		days: z.number().nonnegative(),
		alert: z.boolean().default(false)
	})
);

export const ProjectScope = z.intersection(
	BaseScope,
	z.object({
		mode: z.literal('project'),
		project: z.string()
	})
);
export type ProjectScope = z.infer<typeof ProjectScope>;

export const GroupScope = z.intersection(
	BaseScope,
	z.object({
		mode: z.literal('group'),
		group: z.string()
	})
);
export type GroupScope = z.infer<typeof GroupScope>;

export const MyScope = z.intersection(
	DraftScope,
	z.object({
		mode: z.literal('my')
	})
);
export type MyScope = z.infer<typeof MyScope>;

export const Scope = z.union([ProjectScope, GroupScope, MyScope]);
export type Scope = z.infer<typeof Scope>;

import chalk from 'chalk'
import { safeParse } from 'valibot'

import type { GenericSchema } from 'valibot'

export function handleParse<TSchema extends GenericSchema>(schema: TSchema) {
	const result = safeParse(schema, Bun.env)
	if (result.success) return result.output

	let issues = ''
	for (const issue of result.issues) {
		issues += issue.path
			? // @ts-expect-error wtf valibot
				`❌ Missing env: ${chalk.bold(issue.path?.[0].key)}\n`
			: '❌ Missing env variable, check your .env file.\n'
	}
	console.log(issues)
	process.exit(1)
}

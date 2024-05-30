import chalk from 'chalk'
import { safeParse } from 'valibot'

import type { BaseSchema } from 'valibot'

export function handleParse<TSchema extends BaseSchema>(schema: TSchema) {
	const result = safeParse(schema, Bun.env)
	if (result.success) return result.output

	let issues = ''
	for (const issue of result.issues) {
		issues += issue.path
			? `❌ Missing env: ${chalk.bold(issue.path?.[0].key)}\n`
			: '❌ Missing env variable, check your .env file.\n'
	}

	console.log(issues)
	process.exit(1)
}

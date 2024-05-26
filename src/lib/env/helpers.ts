import chalk from 'chalk'
import { safeParse } from 'valibot'

import type { BaseSchema, BaseTransformation } from 'valibot'

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

export interface FromEnvTransformer extends BaseTransformation<string> {
	readonly type: 'from_env'
	readonly reference: typeof fromEnv
}

export function fromEnv(): FromEnvTransformer {
	return {
		reference: fromEnv,
		type: 'from_env',
		async: false,
		_parse: input => {
			const transformedInput = input.replace('""', '')
			if (transformedInput === '') {
				return {
					issues: [
						{
							input: input,
							message: 'Environment variable not defined',
							context: {
								value: input,
								expects: 'string',
								type: 'string',
								message: 'Environment variable not defined',
								requirement: 'defined'
							},
							label: 'from_env',
							reference: fromEnv
						}
					]
				}
			}
			return { output: input.replace('""', '') }
		}
	}
}

import { Environment } from '@types'
import * as v from 'valibot'

import { handleParse } from './helpers'

//* Define environment variables here
const envSchema = v.object({
	NODE_ENV: v.optional(v.enum_(Environment), Environment.development),
	DISCORD_TOKEN: v.string([v.minLength(1)]),
	GLOBAL_DISCORD_TOKEN: v.string([v.minLength(1)]),
	CLIENT_ID: v.string([v.minLength(1)]),
	GLOBAL_CLIENT_ID: v.string([v.minLength(1)]),
	GLOBAL_PUSH: v.optional(
		v.coerce(v.boolean(), i => i === 'true'),
		false
	),
	DEV_GUILD: v.string([v.minLength(1)])
})

export default handleParse(envSchema)

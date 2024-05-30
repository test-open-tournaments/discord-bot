import { Environment } from '@types'
import * as v from 'valibot'

import { handleParse } from './helpers'

//* Define environment variables here
const envSchema = v.object({
	NODE_ENV: v.optional(v.enum_(Environment), Environment.development),
	CLIENT_ID: v.string([v.minLength(1)]),
	DISCORD_TOKEN: v.string([v.minLength(1)]),
	GLOBAL_PUSH: v.optional(
		v.coerce(v.boolean(), i => i === 'true'),
		false
	),
	DEV_ID: v.string([v.minLength(1)]),
	DEV_GUILD: v.string([v.minLength(1)]),
	SUPABASE_URL: v.string([v.minLength(1)]),
	SUPABASE_SERVICE_ROLE_KEY: v.string([v.minLength(1)])
})

export default handleParse(envSchema)

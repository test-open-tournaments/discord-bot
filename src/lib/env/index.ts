import { Environment } from '@types'
import { boolean, coerce, enum_, object, optional, string } from 'valibot'

import { fromEnv, handleParse } from './helpers'

//* Define environment variables here
const envSchema = object({
	NODE_ENV: optional(enum_(Environment), Environment.development),
	DISCORD_TOKEN: string([fromEnv()]),
	GLOBAL_DISCORD_TOKEN: string([fromEnv()]),
	CLIENT_ID: string([fromEnv()]),
	GLOBAL_CLIENT_ID: string([fromEnv()]),
	GLOBAL_PUSH: optional(
		coerce(boolean(), i => i === 'true'),
		false
	),
	DEV_GUILD: string([fromEnv()])
})

export default handleParse(envSchema)

import env from '@env'
import { DiscordBot } from 'zenith'

const bot = new DiscordBot({
	startOnInitialize: false,
	developers: [env.DEV_ID],
	intents: ['Guilds', 'GuildMembers', 'GuildMessages']
})

await bot.start()

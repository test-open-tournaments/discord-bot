import '@env'
import { DiscordBot } from 'zenith'

const bot = new DiscordBot({
	startOnInitialize: false,
	developers: ['1098012402324349070'],
	intents: ['Guilds', 'GuildMembers', 'GuildMessages']
})

await bot.start()

import { readdir } from 'node:fs/promises'
import { Client, Collection } from 'discord.js'

import { Logger } from '..'
import { ZenithErrorCodes } from '../types'
import { interactionHandler } from '../utils/interaction-handler'
import { ZenithError } from './zenith-error'

import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import type { ClientEvents } from 'discord.js'
import type { Database } from '~/types/database.types'
import type {
	Command,
	Cooldown,
	DiscordBotOptions,
	Event,
	EventOptions
} from '../types'

export class DiscordBot extends Client {
	startOnInitialize: DiscordBotOptions['startOnInitialize']
	developers: DiscordBotOptions['developers']
	monitoring: DiscordBotOptions['monitoring']
	entryLocation: DiscordBotOptions['entryLocation']
	online = false
	logger: Logger
	commands = new Collection<string, Command>()
	cooldowns = new Collection<string, Cooldown>()
	db: SupabaseClient<Database>

	constructor({
		intents = ['Guilds'],
		token = process.env.DISCORD_TOKEN,
		loggerEvents = 'all',
		startOnInitialize = true,
		developers = [],
		monitoring = {
			enabled: false,
			url: '',
			method: 'POST',
			interval: 3
		},
		entryLocation = '/src',
		supabaseUrl = process.env.SUPABASE_URL,
		supabaseKey = process.env.SUPABASE_KEY
	}: Partial<DiscordBotOptions>) {
		if (!token) {
			throw new ZenithError({
				code: ZenithErrorCodes.InvalidDiscordToken,
				message:
					'Please set the token in the options or in the environment variable DISCORD_TOKEN.'
			})
		}

		if (!supabaseUrl || !supabaseKey) {
			throw new ZenithError({
				code: ZenithErrorCodes.InvalidSupabaseCredentials,
				message:
					'Please set the supabase url and key in the options or in the environment variables SUPABASE_URL and SUPABASE_KEY.'
			})
		}

		if (entryLocation !== '/src' && !entryLocation.startsWith('/')) {
			throw new ZenithError({
				code: ZenithErrorCodes.InvalidEntryLocation,
				message:
					'Invalid entry location. Please ensure the entry location starts with a / or use the default value of /src.'
			})
		}

		if (monitoring.enabled && !monitoring.url) {
			throw new ZenithError({
				code: ZenithErrorCodes.InvalidMonitoringURL,
				message:
					'You must provide a monitoring url if you want to enable monitoring.'
			})
		}

		if (monitoring.enabled && monitoring.interval && monitoring.interval < 1) {
			throw new ZenithError({
				code: ZenithErrorCodes.InvalidMonitoringInterval,
				message: 'Monitoring interval must be longer than 1 minute.'
			})
		}

		super({ intents })
		this.token = token
		this.startOnInitialize = startOnInitialize
		this.developers = developers
		this.monitoring = monitoring
		this.entryLocation = `${process.cwd()}${entryLocation}`
		this.logger = new Logger(loggerEvents)
		this.db = createClient(supabaseUrl, supabaseKey)

		if (this.startOnInitialize) this.start()
		if (this.monitoring.enabled) this._monitor()

		this.on('interactionCreate', async interaction => {
			await interactionHandler(this, interaction).catch(err => {
				this._handleError(err, 'Failed to handle interaction')
			})
		})

		process.on('SIGINT', async () => await this._endProcess())
		process.on('SIGTERM', async () => await this._endProcess())
		process.on('SIGQUIT', async () => await this._endProcess())
	}

	/**
	 * Initializes the commands and events and starts the Discord bot client.
	 *
	 * @throws {ZenithError} If the bot is already started.
	 */
	public async start() {
		if (this.online) {
			throw new ZenithError({
				code: ZenithErrorCodes.BotAlreadyStarted,
				message:
					'Bot is already started. Please use the stop() method before starting the bot again.'
			})
		}

		try {
			await this._initializeCommands()
			await this._initializeEvents()

			await this.login(this.token ?? '')

			this.online = true
			this.logger.ready(this.user?.username ?? 'Bot')
		} catch (err) {
			this._handleError(err, 'Failed to start bot')
			process.exit(1)
		}
	}

	/**
	 * Stops the Discord bot client.
	 */
	public async stop() {
		try {
			await this.destroy()
			this.online = false
			this.logger.stop('Bot offline')
		} catch (err) {
			this._handleError(err, 'Failed to destroy client')
		}
	}

	private async _endProcess() {
		await this.stop()
		process.exit(0)
	}

	private _handleError(err: unknown, message?: string) {
		if (err instanceof Error) {
			return console.log(
				`${message ? `\x1b[31m\x1b[1m${message}: \x1b[0m` : ''}${err.message}`
			)
		}
		return console.log(`Something unexpected happened:\n${err}`)
	}

	private async _monitor() {
		const { url: monitorUrl, method, interval } = this.monitoring
		let url: URL

		try {
			// @ts-expect-error wtf moment
			url = new URL(monitorUrl)
		} catch (err) {
			this._handleError(err, 'Invalid monitoring url')
		}

		setInterval(
			async () => {
				/* 
					Attempts to send monitoring request up to 5 times
					with a 10 second delay between each attempt during
					the interval. if it fails after 5 attempts, throw the error
				*/
				try {
					for (let attempt = 0; attempt < 5; attempt++) {
						try {
							const response = await fetch(url, { method })
							if (response.ok) return
						} catch (err) {
							if (attempt === 5 - 1) throw err
							await new Promise(resolve => setTimeout(resolve, 10 * 1000))
						}
					}
				} catch (err) {
					this._handleError(err, 'Failed to send monitoring request')
				}
			},
			interval ? interval * 60 * 1000 : 5 * 60 * 1000
		)
	}

	private async _initializeCommands() {
		const cmdPath = `${this.entryLocation}/commands`
		const cmdFolders = await readdir(cmdPath).catch(() => {
			throw new ZenithError({
				code: ZenithErrorCodes.NoCommandsFolder,
				message: `No commands folder found. Please ensure you have a folder called commands in the root of your project, or set the entryLocation option to the correct path.\n\n\x1b[34mCurrent Path: \x1b[0m${cmdPath}\x1b[0m`
			})
		})

		for (const folder of cmdFolders) {
			const files = await readdir(`${cmdPath}/${folder}`).catch(() => {
				throw new ZenithError({
					code: ZenithErrorCodes.InvalidCommandFolderStructure,
					message:
						'Invalid command folder structure. Please ensure you have a folder for each command category in the commands folder.'
				})
			})

			const cmdFiles = files.filter(file => /\.ts$/.test(file))

			for (const file of cmdFiles) {
				const filePath = `${cmdPath}/${folder}/${file}`
				const command = (await import(filePath)).default as Command | undefined

				if (!command?.data || !command?.execute) {
					this.logger.warn(`Invalid command at: ${filePath}`, 'high')
					continue
				}

				this.commands.set(command.data.name, command)
				this.logger.command(command.data.name, command.devOnly)
			}
		}
	}

	private async _initializeEvents() {
		const eventsPath = `${this.entryLocation}/events`
		let files: string[] = []
		try {
			files = await readdir(eventsPath)
		} catch (err) {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			if ((err as any)?.code === 'ENOENT') {
				throw new ZenithError({
					code: ZenithErrorCodes.NoEventsFolder,
					message: `No events folder found. Please ensure you have a folder called events in the root of your project, or set the entryLocation option to the correct path.\n\n\x1b[34mCurrent Path: \x1b[0m${eventsPath}\x1b[0m`
				})
			}
		}

		const eventFiles = files.filter(file => /\.ts$/.test(file))

		for (const file of eventFiles) {
			const filePath = `${eventsPath}/${file}`
			const rawEvent = (await import(filePath)).default

			if (!rawEvent?.type || !rawEvent?.execute) {
				this.logger.warn(`Invalid event at: ${filePath}`, 'high')
				continue
			}

			if (!rawEvent?.name) rawEvent.name = file.split('.')[0]

			const event = rawEvent as Event<typeof rawEvent.type>
			const listener = event.once ? this.once : this.on
			listener.call(this, event.type, (...args) => event.execute(this, ...args))
			this.logger.event(event.name ?? '<no-name>', event.type)
		}
	}
}

/**
 * Creates a command for the Discord bot.
 *
 * @param {Command} command - The command details and function to execute.
 */
export function createCommand(command: Command): Command {
	return command
}

/**
 * Creates a event for the Discord bot.
 *
 * @param {EventType} type - The event type.
 * @param {EventOptions} details - The event name and function to execute.
 */
export function createEvent<EventType extends keyof ClientEvents>(
	type: EventType,
	{ name, execute }: EventOptions<EventType>
): Event<EventType> {
	return {
		name,
		type,
		execute
	}
}

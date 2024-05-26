import type {
	BitFieldResolvable,
	ChatInputCommandInteraction,
	ClientEvents,
	Collection,
	GatewayIntentsString,
	PermissionResolvable,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from 'discord.js'
import type { DiscordBot } from '..'

export type LoggerEvents = 'commands' | 'events' | 'started' | 'stopped'

export interface DiscordBotOptions {
	intents: BitFieldResolvable<GatewayIntentsString, number>
	token: string
	loggerEvents: LoggerEvents[] | 'all'
	startOnInitialize: boolean
	developers: string[]
	monitoring: {
		enabled: boolean
		url: string
		method?: 'POST' | 'GET' | 'PATCH' | 'PUT' | 'DELETE'
		interval?: number
	}
	entryLocation: string
}

export interface EventOptions<EventType extends keyof ClientEvents> {
	name?: string
	once?: boolean
	execute: (client: DiscordBot, ...args: ClientEvents[EventType]) => void
}

export interface Command {
	devOnly?: boolean
	cooldown?: number
	permissions?: PermissionResolvable[]
	requiredRoles?: string[]
	data:
		| SlashCommandBuilder
		| Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
		| SlashCommandSubcommandsOnlyBuilder
	execute: ({
		interaction,
		client
	}: {
		interaction: ChatInputCommandInteraction
		client: DiscordBot
	}) => void
}

export interface Event<
	EventType extends keyof ClientEvents = keyof ClientEvents
> extends EventOptions<EventType> {
	type: keyof ClientEvents
}

export enum ZenithErrorCodes {
	BotAlreadyStarted = 'BOT_ALREADY_STARTED',
	NoEventsFolder = 'NO_EVENTS_FOLDER',
	NoCommandsFolder = 'NO_COMMANDS_FOLDER',
	InvalidCommandFolderStructure = 'INVALID_COMMAND_FOLDER_STRUCTURE',
	InvalidDiscordToken = 'INVALID_DISCORD_TOKEN',
	InvalidEntryLocation = 'INVALID_ENTRY_LOCATION',
	InvalidMonitoringURL = 'INVALID_MONITORING_URL',
	InvalidMonitoringInterval = 'INVALID_MONITORING_INTERVAL',
	FailedToAddUnverifiedRole = 'FAILED_TO_ADD_UNVERIFIED_ROLE'
}

export interface ZenithErrorOptions {
	code: ZenithErrorCodes | keyof typeof ZenithErrorCodes
	message: string
}

export type Cooldown = Collection<string, number>

export type WarnLevel = 'low' | 'medium' | 'high'

export interface LogOptions {
	color: keyof typeof LogColor
	label?: string
	details?: string
	message: string
}

export enum LogColor {
	INFO = '\x1b[1m\x1b[34m',
	WARN = '\x1b[1m\x1b[33m',
	ERROR = '\x1b[1m\x1b[31m',
	SUCCESS = '\x1b[1m\x1b[32m',
	COMMAND = '\x1b[1m\x1b[36m',
	EVENT = '\x1b[1m\x1b[35m'
}

export enum LogBackgroundColor {
	INFO = '\x1b[1m\x1b[44m',
	WARN = '\x1b[1m\x1b[43m',
	ERROR = '\x1b[1m\x1b[41m',
	SUCCESS = '\x1b[1m\x1b[42m',
	COMMAND = '\x1b[1m\x1b[46m',
	EVENT = '\x1b[1m\x1b[45m'
}

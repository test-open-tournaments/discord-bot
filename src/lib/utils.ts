import env from '@env'

import type { Client, Guild } from 'discord.js'
import type { DiscordBot } from './zenith'

/** Whether the environment is production. */
export const isProd = env.NODE_ENV === 'production'

/** The default color for embeds. */
export const embedColor = '#5E72EB'

/**
 * Attempts to get a guild from the cache, if it doesn't exist it will fetch it.
 *
 * @param client - The client to fetch the guild from.
 * @param id - The id of the guild to fetch.
 */
export async function guildFetch(client: DiscordBot | Client, id: string) {
	return client.guilds.cache.get(id) ?? (await client.guilds.fetch(id))
}

/**
 * Attempts to get a member from the cache, if it doesn't exist it will fetch it.
 *
 * @param guild - The guild to fetch the member from.
 * @param id - The id of the member to fetch.
 */
export async function memberFetch(guild: Guild, id: string) {
	return guild.members.cache.get(id) ?? (await guild.members.fetch(id))
}

/**
 * Attempts to get a channel from the cache, if it doesn't exist it will fetch it.
 *
 * @param guild - The guild to fetch the channel from.
 * @param id - The id of the channel to fetch.
 */
export async function channelFetch(guild: Guild, id: string) {
	return guild.channels.cache.get(id) ?? (await guild.channels.fetch(id))
}

/**
 * Waits for the specified amount of time.
 *
 * @param {number} ms - The amount of time to wait in milliseconds.
 */
export async function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

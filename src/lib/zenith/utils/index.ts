import type { SupabaseClient } from '@supabase/supabase-js'
import type {
	BaseMessageOptions,
	InteractionReplyOptions,
	MessagePayload
} from 'discord.js'
import type { Database } from '~/types/database.types'

/**
 * A small wrapper to make ephemeral messages easier to send.
 *
 * @param {string | Omit<BaseMessageOptions, 'content'>} content - The message content to send.
 */
export function ephem(
	content: string | Omit<BaseMessageOptions, 'content'>
): MessagePayload | InteractionReplyOptions {
	return typeof content === 'string'
		? { content, ephemeral: true }
		: { ...content, ephemeral: true }
}

/**
 * Fetches the guild settings from the database.
 *
 * @param {SupabaseClient<Database>} db - The Supabase client.
 * @param {string} guildId - The ID of the guild.
 */
export async function getSettings(
	db: SupabaseClient<Database>,
	guildId: string
) {
	return (
		await db.from('settings').select('*').eq('guild_id', guildId).maybeSingle()
	).data
}

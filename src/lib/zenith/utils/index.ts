import type {
	BaseMessageOptions,
	InteractionReplyOptions,
	MessagePayload
} from 'discord.js'

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

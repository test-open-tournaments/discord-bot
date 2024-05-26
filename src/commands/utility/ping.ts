import { embedColor } from '@utils'
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { createCommand } from 'zenith'

export default createCommand({
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with your ping to the bot and discord.'),
	async execute({ interaction, client }) {
		await interaction.reply({ content: 'Fetching ping...' })

		const message = await interaction.fetchReply()
		const roundtrip = message.createdTimestamp - interaction.createdTimestamp

		const pingEmbed = new EmbedBuilder()
			.setTitle('Latency')
			.setColor(embedColor)
			.setDescription(
				`Discord API: \`${client.ws.ping}ms\` \n Roundtrip Latency: \`${roundtrip}ms\``
			)

		await interaction.editReply({ content: null, embeds: [pingEmbed] })
	}
})

import { Collection } from 'discord.js'

import { ephem } from '.'

import type { Interaction } from 'discord.js'
import type { DiscordBot } from '..'

export async function interactionHandler(
	client: DiscordBot,
	interaction: Interaction
) {
	if (!interaction.isChatInputCommand()) return
	client.logger.info(
		`[COMMAND] @${interaction.user.tag} ran command ${interaction.commandName}`
	)

	const command = client.commands.get(interaction.commandName)
	if (!command) {
		await interaction.reply(ephem('This command does not seem to exist?'))
		return
	}

	if (command.devOnly && !client.developers.includes(interaction.user.id)) {
		await interaction.reply(
			ephem('This command can only be ran by a developer.')
		)
		return
	}

	if (
		command.permissions &&
		!command.permissions.some(p => interaction.memberPermissions?.has(p))
	) {
		await interaction.reply(
			ephem('You seem to be missing permissions to run this command.')
		)
		return
	}

	const userCooldowns = client.cooldowns.get(interaction.user.id)
	const cooldown = userCooldowns?.get(command.data.name)

	if (command.cooldown && cooldown) {
		const now = Date.now()
		const cmdCooldown = command.cooldown * 1000

		if (now < cooldown + cmdCooldown) {
			const remainingCooldown = (cooldown + cmdCooldown - now) / 1000

			await interaction.reply(
				ephem(
					`Please wait ${remainingCooldown.toFixed(
						1
					)} more seconds before using this command again.`
				)
			)
			return
		}
	} else if (command.cooldown && !cooldown) {
		const newCooldown = new Collection<string, number>().set(
			command.data.name,
			Date.now()
		)
		client.cooldowns.set(interaction.user.id, newCooldown)
	}

	try {
		command.execute({ interaction, client })
	} catch (err) {
		if (err instanceof Error) {
			client.logger.error(`Failed to execute command: ${err.message}`)
		} else {
			console.log(err)
		}

		await interaction.reply('Failed to run command.')
		return
	}
}

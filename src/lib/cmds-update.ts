import env from '@env'
import { REST, Routes } from 'discord.js'
import { readdir } from 'node:fs/promises'

import { Logger } from './zenith'

import type {
	ApplicationCommand,
	RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js'
import type { Command } from './zenith/types'

const dirname = import.meta.dir.replace('/lib', '')
const environment = env.GLOBAL_PUSH ? 'global' : 'local'
const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []
const logger = new Logger()

async function getCommands() {
	const cmdPath = `${dirname}/commands`
	const cmdFolders = await readdir(cmdPath)

	for (const folder of cmdFolders) {
		const cmdFiles = await readdir(`${cmdPath}/${folder}`)
		const filteredCmdFiles = cmdFiles.filter(file => /\.ts$/.test(file))

		for (const file of filteredCmdFiles) {
			const filePath = `${cmdPath}/${folder}/${file}`
			const command = (await import(filePath)).default as Command | undefined

			if (!command?.data) {
				logger.warn(`Invalid command at: ${filePath}`, 'high')
				continue
			}

			commands.push(command.data.toJSON())
			logger.command(command.data.name)
		}
	}
}

const rest = new REST().setToken(env.DISCORD_TOKEN)

async function deployCommands() {
	logger.info(`deploying ${commands.length} commands to ${environment}`, true)

	let deployData: ApplicationCommand[] = []

	if (env.GLOBAL_PUSH) {
		deployData = (await rest.put(Routes.applicationCommands(env.CLIENT_ID), {
			body: commands
		})) as ApplicationCommand[]
	} else {
		deployData = (await rest.put(
			Routes.applicationGuildCommands(env.CLIENT_ID, env.DEV_GUILD),
			{ body: commands }
		)) as ApplicationCommand[]
	}

	if (deployData.length === 0) {
		return logger.error(`failed to deploy commands to ${environment}`)
	}

	logger.success(`deployed ${deployData.length} commands to ${environment}`)
}

async function run() {
	try {
		await getCommands()
		await deployCommands()
	} catch (err) {
		if (err instanceof Error) return logger.error(err.message)
		console.log(err)
	}
}

run()

import { LogBackgroundColor, LogColor } from '../types'

import type { LogOptions, LoggerEvents, WarnLevel } from '../types'

export class Logger {
	private _bold = '\x1b[1m'
	private _resetColor = '\x1b[0m'
	enabledEvents: LoggerEvents[] | 'all' = 'all'

	constructor(enabledEvents?: LoggerEvents[] | 'all') {
		if (enabledEvents) this.enabledEvents = enabledEvents
	}

	/**
	 * Logs an informational message to the console.
	 *
	 * @param {string} message - The message to be logged.
	 * @param {boolean} [main=false] - Optional param to indicate if this regards the bot's main process.
	 */
	public info(message: string, main?: boolean) {
		console.log(
			this._base({
				color: 'INFO',
				label: main ? 'main' : undefined,
				details: 'Info',
				message
			})
		)
	}

	/**
	 * Logs an warning message to the console.
	 *
	 * @param {string} message - The message to be logged.
	 * @param {WarnLevel} level - Optional param to indicate the severity of the warning.
	 */
	public warn(message: string, level?: WarnLevel) {
		console.log(
			this._base({
				color: 'WARN',
				label: level,
				details: 'Warning',
				message
			})
		)
	}

	/**
	 * Logs an error message to the console.
	 *
	 * @param {string} message - The message to be logged.
	 * @param {boolean} [main=false] - Optional param to indicate if this regards the bot's main process.
	 */
	public error(message: string, main?: boolean) {
		console.log(
			this._base({
				color: 'ERROR',
				label: main ? 'main' : undefined,
				details: 'Error Occurred',
				message
			})
		)
	}

	/**
	 * Logs an success message to the console.
	 *
	 * @param {string} message - The message to be logged.
	 * @param {boolean} [main=false] - Optional param to indicate if this regards the bot's main process.
	 */
	public success(message: string, main?: boolean) {
		console.log(
			this._base({
				color: 'SUCCESS',
				label: main ? 'main' : undefined,
				details: 'Successful',
				message
			})
		)
	}

	/**
	 * Logs an bot ready message to the console.
	 *
	 * @param {string} username - The username of the bot.
	 */
	public ready(username: string) {
		if (!this._enabledEvent('started')) return
		console.log(`${this._bold}Logged in as: ${username}${this._resetColor}`)
	}

	/**
	 * Logs an bot stopped message to the console.
	 *
	 * @param {string} message - The message to be logged.
	 */
	public stop(message: string) {
		if (!this._enabledEvent('stopped')) return
		console.log(
			this._base({
				color: 'ERROR',
				label: 'main',
				details: 'Stopped',
				message
			})
		)
	}

	/**
	 * Logs an command info message to the console.
	 *
	 * @param {string} name - The command name to be logged.
	 * @param {boolean} [devOnly=false] - Optional param to indicate if command is dev only.
	 */
	public command(name: string, devOnly?: boolean) {
		if (!this._enabledEvent('commands')) return
		console.log(
			this._base({
				color: 'COMMAND',
				label: devOnly ? 'dev' : 'public',
				details: 'Loaded Command',
				message: name
			})
		)
	}

	/**
	 * Logs an event info message to the console.
	 *
	 * @param {string} name - The event name to be logged.
	 * @param {string} type - The event type to be logged.
	 */
	public event(name: string, type: string) {
		if (!this._enabledEvent('events')) return
		console.log(
			this._base({
				color: 'EVENT',
				label: name,
				details: 'Started Event',
				message: type
			})
		)
	}

	private _base({ color, label, details, message }: LogOptions) {
		const time = new Date().toLocaleTimeString()
		const textColor = LogColor[color]
		const bgColor = LogBackgroundColor[color]
		const { _resetColor } = this

		return `${textColor}${time} | ${_resetColor}${
			label ? `${bgColor} ${label} \x1b[0m ${textColor}| ${_resetColor}` : ''
		}${details ? `${textColor}${details} : ` : ''}\x1b[0m${message}`
	}

	private _enabledEvent(event: LoggerEvents) {
		return this.enabledEvents === 'all' || this.enabledEvents.includes(event)
	}
}

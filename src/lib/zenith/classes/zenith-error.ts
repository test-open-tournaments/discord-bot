import type { ZenithErrorOptions } from '../types'

export class ZenithError extends Error {
	code: string

	constructor({ code, message }: ZenithErrorOptions) {
		super(message)
		this.code = code
		this.name = 'ZenithError'
		this.message = message
		Object.setPrototypeOf(this, new.target.prototype)
	}
}

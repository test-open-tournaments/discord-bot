import type env from '@env'

export enum Environment {
	development = 'development',
	production = 'production'
}

export type EnvEnum = Record<string, keyof typeof env>

import { fileURLToPath } from "node:url"

/**
 * Helper for creating aliases (intended for **LOCAL** layers).
 *
 * Mostly for grabbing things from the local app (yes, not good, but sometimes complicated to get around).
 *
 * This makes sure to create them in nitro.alias as well.
 *
 * ```ts
 * defineNuxtConfig({
 * 	...createLayerAliases({
 * 		"~~": "../"
 * 	}, import.meta.url))
 * })
 * ```
 */
export function createAliases(
	/* Record<"#alias-name", "path/relative/to/path"> */
	aliases: Record<string, string>,
	/* import.meta.url */
	importMetaUrl: URL
) {
	const aliasesRes = Object.fromEntries(
		Object.entries(aliases).map(([alias, path]) => [
			alias,
			fileURLToPath(new URL(path, importMetaUrl))
		])
	)
	return {
		alias: aliasesRes,
		nitro: {
			alias: aliasesRes
		}
	}
}

import { addImports } from "@nuxt/kit"
import fastGlob from "fast-glob"
import path from "path"

import { globFiles } from "./globFiles.js"

// #awaiting https://github.com/jsdoc/jsdoc/issues/821#issuecomment-385324492
/**
 * Like `addImports` but with globs and can exclude files (index, .d.ts, and stories files are excluded by default).
 *
 * .d.ts files are ignored because when a module is built/packed, it will create .d.ts files you might accidentally include which you wouldn't think existed by just looking at src, but `resolve` is relative to `dist` in production.
 *
 * Can't use real globs examples because of jsdoc escape issues.
 *
 * ```ts
 * addImportsCustom([
 * 	`${resolve("composables")}/{GLOB}`,
 * 	`${resolve("utils")}/{GLOBk}`, ],
 *	["{GLOB}"]) // ignore globs
 * ```
 */
export function addImportsCustom<T = { name: string, filepath: string }>(
	globs: string[],
	ignore: string[] = [],
	cb = (imp: string, name: string): T => {
		addImports({
			name,
			from: imp,
		})
		return { name, filepath: imp } as T
	},
): T[] {
	return globFiles(globs, ignore, cb)
}

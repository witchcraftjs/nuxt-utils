import type { NuxtConfig } from "nuxt/schema"

/**
 * Setups up nuxt to work with file based routing.
 *
 * Also enables hash based router so history works.
 *
 * Normally nuxt will not use relative paths in imports which creates a problem in builds that require static file based routing like electron/capacitor/etc.
 */

export function nuxtFileBasedRouting() {
	return {
		// for proper history
		router: {
			options: {
				hashMode: true
			}
		}
	} satisfies NuxtConfig
}

import type { Nuxt, NuxtPage } from "nuxt/schema"

import { pagePathMatchesRoutePattern } from "./pagePathMatchesRoutePattern.js"

/** Remove extraneous unneeded routes from the build, only keep given routes. {@link pagePathMatchesRoutePattern} decides how they are matched. */

export function nuxtRemoveUneededPages(nuxt: Nuxt, routesToInclude: string[]) {
	nuxt.hook("pages:extend", (pages: NuxtPage[]) => {
		const toRemove = []
		for (const page of pages) {
			const isWanted = routesToInclude.some(route => pagePathMatchesRoutePattern(page.path, route))
			if (!isWanted) {
				toRemove.push(page)
			}
		}
		for (const page of toRemove) pages.splice(pages.indexOf(page), 1)
	})
}

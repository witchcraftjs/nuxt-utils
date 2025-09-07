import type { Nuxt, NuxtPage } from "nuxt/schema"

/** Remove extraneous unneeded routes from the build, only keep given routes. */

export function nuxtRemoveUneededPages(nuxt: Nuxt, routesToInclude: string[]) {
	nuxt.hook("pages:extend", (pages: NuxtPage[]) => {
		const toRemove = []
		for (const page of pages) {
			const isWanted = routesToInclude.includes(page.path)
			if (!isWanted) {
				toRemove.push(page)
			}
		}
		for (const page of toRemove) pages.splice(pages.indexOf(page), 1)
	})
}

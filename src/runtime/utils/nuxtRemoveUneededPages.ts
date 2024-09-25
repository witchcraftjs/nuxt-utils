import { type NuxtPage } from "nuxt/schema"

/** Remove extraneous unneeded routes from the build, only keep given routes. */
export function nuxtRemoveUneededPages(pages: NuxtPage[], routesToInclude: string[]) {
	const toRemove = []
	for (const page of pages) {
		const isWanted = routesToInclude.some(route => route === page.path)
		if (!isWanted) {
			toRemove.push(page)
		}
	}
	for (const page of toRemove) pages.splice(pages.indexOf(page), 1)
}


function normalizeRoutePath(path: string): string {
	// a modifier never changes which route is named, so it is dropped from both sides before comparing
	return path.replace(/\/$/, "")
		.split("/")
		.map(segment => segment.startsWith(":")
			? `:${segment.slice(1)
				.split(/[?+*()]/)[0]}`
			: segment)
		.join("/")
}

/**
 * Whether a page path scanned by nuxt matches the given route pattern.
 *
 * Nuxt prints a dynamic segment in vue-router syntax, so `pages/users/[username].vue` arrives as `/users/:username()` ({@link https://router.vuejs.org/guide/essentials/route-matching-syntax.html}) when filtering pages and in related functions. While the same route written by hand is typically `/users/:username`.
 *
 * This compares the two paths with the modifiers dropped from both sides. So `/users/:username()` now is considered equal to `/users/:username`.
 *
 */
export function pagePathMatchesRoutePattern(pagePath: string, routePattern: string): boolean {
	return normalizeRoutePath(pagePath) === normalizeRoutePath(routePattern)
}

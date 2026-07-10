import { callOnce } from "#app"

/**
 * Intended to help with things like initializations on the client (e.g. databases, stores, etc.)
 *
 * Note that if your imports have side effect, this function won't save you. Easiest solution in nuxt is to place this function in a client-only component, e.g. Setup.client.vue. Makes it nice and easy to wrap around the client only code that actually needs the initializations. Alternatively use async imports.
 */
export async function callOnceOnClient<T extends (...args: any[]) => any>(
	key: string,
	fn: T
): Promise<void> {
	if (import.meta.server) return
	return callOnce(key, fn)
}

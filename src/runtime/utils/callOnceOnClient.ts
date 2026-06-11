import { callOnce } from "#app"

export async function callOnceOnClient<T extends (...args: any[]) => any>(
	key: string,
	fn: T
): Promise<void> {
	if (import.meta.server) return
	return callOnce(key, fn)
}

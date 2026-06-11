import { onBeforeUnmount, ref } from "vue"

/**
 * Ensures only one tab per key (e.g., per user) is the "primary" tab.
 * Uses the browser Locks API so tabs coordinate automatically.
 *
 * The first tab to open gets the lock. Subsequent tabs get `isPrimary = false`.
 * When the primary tab closes, another tab automatically becomes primary.
 *
 * ```ts
 * <script setup lang="ts">
 * // use someething like the app + user id as the key
 * const userId = useAuth().user.value.id
 * const appName = useRuntimeConfig().public.publicInfo.name // or wherever you store your app name
 * const { isPrimary, requestLock } = useDuplicateTabGuard(appName + userId)
 * </script>
 *
 * <template>
 *    // let the user attempt to force this tab to become primary
 *		// note requestLock is async and isPrimary.value should be true after it resolves (usually)
 * 	<button @click="requestLock"/>
 * </template>
 * ```
 *
 * @experimental
 */
export function useDuplicateTabGuard(key: string, lockPrefix: string = `tab-lock:`) {
	if (import.meta.server) {
		// we can't throw if we want this to be somewhat easily usable
		return { isPrimary: ref(true), claimLeadership: () => {} }
	}
	const isPrimary = ref(false)
	const LOCK_NAME = lockPrefix + key

	// if we decide to steal the lock, cancel the request
	let controller = new AbortController()

	const startLock = async (steal = false) => {
		if (isPrimary.value && !steal) return

		if (controller) controller.abort()
		controller = new AbortController()

		await navigator.locks.request(
			LOCK_NAME,
			{
				// we can't use both options at the same time
				...(steal
					? { steal: true }
					: { signal: controller.signal })
			},
			async () => {
				isPrimary.value = true

				// if another tab "steals" this lock, this promise
				// will be rejected by the browser with an 'AbortError'.
				await new Promise((resolve, _reject) => {
					controller.signal.addEventListener("abort", () => resolve(undefined))
				})
			}
		).catch(err => {
			// only set to false if the lock was stolen or  the error error wasn't triggered by our own manual logic

			if (err.name !== "AbortError" || !controller.signal.aborted) {
				isPrimary.value = false
				if (err.name !== "AbortError") {
					// eslint-disable-next-line no-console
					console.error("TabGuard Error:", err)
				}
			}
		})
	}

	/**
	 * Forces this tab to become the primary tab,
	 * displacing any other tab currently holding the lock.
	 *
	 * You can check the result by awaiting it then checking `isPrimary`.
	 *
	 * Other tabs can be notified by watching the `isPrimary` ref.
	 *
	 * Note it may fail, always use `isPrimary` as the source of truth.
	 */
	const requestLock = () => startLock(true)

	void startLock()

	onBeforeUnmount(() => {
		controller.abort()
	})

	return {
		isPrimary,
		requestLock
	}
}

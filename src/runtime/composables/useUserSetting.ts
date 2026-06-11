import { useStorage } from "@vueuse/core"

const existingStorages = new Map()
/**
 * Use/store a client-side **local** and **user** specific setting object.
 *
 * Syncs the returned ref to localStorage usign `@vueuse/core`'s `useStorage` composable. Key is `${keyPrefix}:settings:${userId}`. Prefix should be something like the app's name (e.g. useRuntimeConfig().public.appInfo.name or wherever you store it).
 *
 * Can be called multiple times (the same ref instance for the key will be returned). An object with default values can be passed on first call.
 */
export function useUserSetting(
	keyPrefix: string,
	userId: string,
	defaultValue: any = {}
) {
	const key = `${keyPrefix}:settings:${userId}`
	const existing = existingStorages.get(key)
	if (existing) return existing
	const state = useStorage(
		key,
		defaultValue,
		localStorage,
		{ mergeDefaults: true }
	)
	return state
}

import type { StandardSchemaV1 } from "@standard-schema/spec"
import { useStorage } from "@vueuse/core"

const existingStorages = new Map()
/**
 * Use/store a client-side **local** and **user** specific setting object.
 *
 * Syncs the returned ref to localStorage usign `@vueuse/core`'s `useStorage` composable. Key is `${keyPrefix}:settings:${userId}`. Prefix should be something like the app's name (e.g. useRuntimeConfig().public.appInfo.name or wherever you store it). Key format can be changed by the constructKey options.
 *
 * Can be called multiple times (the same ref instance for the key will be returned). An object with default values can be passed on first call.
 *
 * Has optional schema support. The schema should have default values for all keys for a better UX.
 */
export function useUserSetting(
	keyPrefix: string,
	userId: string,
	defaultValue: any = {},
	schema?: StandardSchemaV1<Record<string, any>, Record<string, any>>,
	{
		debug = false,
		constructKey = (keyPrefix, userId) => `${keyPrefix}:settings:${userId}`
	}: {
		constructKey?: ((keyPrefix: string, userId: string) => string)
		debug?: boolean
	} = {}
) {
	const key = constructKey(keyPrefix, userId)
	const existing = existingStorages.get(key)
	if (existing) return existing
	const state = useStorage(
		key,
		defaultValue,
		localStorage,
		{ mergeDefaults: true }
	)
	if (schema) {
		if (debug) {
			// eslint-disable-next-line no-console
			console.log("useStorage loaded: ", state.value)
			// eslint-disable-next-line no-console
			console.log("Using schema to validate ", key)
		}
		const parsed = schema["~standard"].validate(state.value)
		if (parsed instanceof Promise) {
			throw new TypeError("Async validation schemas are not supported here.")
		}
		if (parsed.issues) {
			state.value = defaultValue
			if (debug) {
				// eslint-disable-next-line no-console
				console.error("Issues parsing, setting to default value", parsed.issues)
			}
		} else {
			if (debug) {
				// eslint-disable-next-line no-console
				console.log("Setting parsed value: ", parsed.value)
			}
			state.value = parsed.value
		}
	}
	return state
}

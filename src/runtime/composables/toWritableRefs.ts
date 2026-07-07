import type { WritableComputedRef } from "vue"

import { toWritableRef } from "./toWritableRef.js"

/**
 * Creates computed getter/setters for multiple properties on an object that may be replaced.
 *
 * Wraps `toWritableRef` so you can destructure like `toRefs` but with survival
 * across object replacement.
 *
 * ```ts
 * // e.g. here frame.value.meta itself might get completely replaced, otherwise breaking the refs
 * const { camera, showNoteOverlay } = toWritableRefs(() => frame.value.meta, "camera", "showNoteOverlay")
 * ```
 */
export function toWritableRefs<T extends object>(
	getObj: () => T,
	...keys: Array<keyof T>
): { [K in keyof T]: T[K] extends T[keyof T] ? WritableComputedRef<T[K]> : never } {
	const result = {} as Record<string, WritableComputedRef<unknown>>
	for (const key of keys) {
		result[key as string] = toWritableRef(getObj, key)
	}
	return result as any
}

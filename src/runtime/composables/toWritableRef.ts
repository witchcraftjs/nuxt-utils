import { computed, type WritableComputedRef } from "vue"

/**
 * Creates a computed getter/setter to a property on an object that may be replaced.
 *
 * Vue's `toRefs` binds to the specific proxy instance, so if the object is
 * replaced (`obj = newObj`) the refs become orphaned. This composable uses a
 * computed getter/setter that always reads from the *current* object reference,
 * surviving object replacement.
 *
 *
 * ```ts
 * const property = toObjectRef(() => someObject.that.propertyMightBeReplaced, "prop")
 * ```
 *
 * @experimental
 */
export function toWritableRef<T extends object, TKey extends keyof T>(
	getObj: () => T,
	key: TKey
): WritableComputedRef<T[TKey]> {
	return computed<T[TKey]>({
		get: (): T[TKey] => {
			const obj = getObj()
			if (obj === undefined) return undefined as any
			return getObj()[key]
		},
		set: (val: T[TKey]) => {
			getObj()[key] = val
		}
	})
}

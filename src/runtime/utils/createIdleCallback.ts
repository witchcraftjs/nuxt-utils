import { ref } from "vue"

export function createIdleCallback(callback: () => void, options?: {
	timeout?: number
}) {
	const syncIdleCallback = ref<number | undefined>(undefined)
	function trigger() {
		if (syncIdleCallback.value) window.cancelIdleCallback(syncIdleCallback.value)
		syncIdleCallback.value = requestIdleCallback(callback, options)
	}
	function cancelPendingCallbacks() {
		if (syncIdleCallback.value) window.cancelIdleCallback(syncIdleCallback.value)
	}
	function callImmediately() {
		callback()
	}
	return {
		trigger,
		cancelPendingCallbacks,
		callImmediately
	}
}

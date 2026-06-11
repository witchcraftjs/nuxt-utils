import type { Ref } from "vue"
import { ref, watch } from "vue"
/**
 * For async operations sometimes it actually loads so fast the loading indicator is not visible but we still want it to be briefly visible. This delays the setting of the returned ref to false by the given timeout so it at least flashes onscreen.
 *
 * Setting to true is not delayed.
 *
 * If the indicator is set to true while the timeout is still running, it's canceled.
 */

export function useDelayedLoadingIndicator(
	loading: Ref<boolean>,
	timeout: number = 100
) {
	const showLoadingIndicator = ref(false)
	let loadingTimeout: number | NodeJS.Timeout | undefined
	watch(loading, newVal => {
		clearTimeout(loadingTimeout)
		if (newVal === true) {
			showLoadingIndicator.value = true
		} else {
			loadingTimeout = setTimeout(() => {
				if (loading.value === false) {
					showLoadingIndicator.value = false
				}
			}, timeout)
		}
	})
	return showLoadingIndicator
}

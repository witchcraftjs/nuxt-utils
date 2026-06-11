import { useId } from "vue"

export function useFallbackId(props: { id?: string }) {
	const fallbackId = props.id ?? useId()
	return fallbackId
}

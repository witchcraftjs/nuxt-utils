import { nextTick, ref, watchEffect } from "vue"

/**
 * Manages focus for an inline edit toggle. When `isEditing` flips `true`,
 * focus moves to the target element. When it flips `false`, focus returns
 * to the same element (useful for returning focus to an edit trigger).
 *
 * Put the returned `class` on the element that should receive focus in both
 * states — typically the edit button/trigger.
 *
 * ```ts
 * <script setup lang="ts">
 * // In a component that toggles between a label and an editor
 * const id = useId()
 * const { isEditing, class: toggleFocusClass } = useToggleFocus(id)
 * </script>
 * <template>
 * 	<WButton :class="toggleFocusClass" @click="isEditing = true">Edit</WButton>
 * 	// Now when the editor cancels and isEditing flips false, focus returns to the button.
 * 	<Editor v-if="isEditing" @cancel="isEditing = false" />
 * </template>
 * ```
 */
export function useToggleFocus(id: string) {
	const editing = ref(false)
	watchEffect(() => {
		if (editing.value) {
			void nextTick(() => {
				const focusable = document.querySelector(`.focusable-${id}`)
				if (focusable && focusable instanceof HTMLElement) {
					focusable.focus()
				} else {
					// eslint-disable-next-line no-console
					console.log(
						"No focusable element found. Be sure to set the `focusable-${id}` *class* on the element."
					)
				}
			})
		} else {
			void nextTick(() => {
				const trigger = document.querySelector(`.focusable-${id}`)
				if (trigger && trigger instanceof HTMLElement) {
					trigger.focus()
				} else {
					// eslint-disable-next-line no-console
					console.log("No trigger found. Be sure to set the `focusable-${id}` *class* on the element.")
				}
			})
		}
	})
	return {
		isEditing: editing,
		class: `focusable-${id}`
	}
}

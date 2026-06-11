import type { StandardSchemaV1 } from "@standard-schema/spec"
import { refDebounced } from "@vueuse/core"
import type { Ref } from "vue"
import { computed, ref } from "vue"
import { z } from "zod"

import { useAsyncData } from "#app"

/**
 * Wrapper for handling complex async validation of a value.
 *
 * Can optionally also be given a schema to validate the value against before trying the server.
 *
 * Useful for things like usernames, where only some of the validation can be done client-side.
 *
 * Handles debouncing, and handling all the error states (local from the schema, from the server validation, and any additional errors from submitting (optional)).
 *
 * Notes:
 * - Remember to gate the button with `v-if` canSubmit.
 * - If wrapping handleSubmit, also remember to check `canSubmit` first. Prefer using modifyFetch if you need to add something to the request.
 * - inputValid is only a visual indicator and is valid for empty inputs and when the server is validating a request. Value might still be invalid.
 * - The typing of res will fail if the route is not a const string.
 *
 * ```ts
 * <script setup lang="ts">
 * const { errors, status, statusText, canSubmit, inputValid } = useAsyncValidation(
 * 	value,
 * 	"asyncDataKey",
 * 	"/api/check",
 * 	additionalErrors,
 * 	{
 * 		debounce: 1000,
 * 		statusTextMap: {
 * 			loading: "Checking....",
 * 			valid: "Valid",
 * 			invalid: "Invalid"
 * 		},
 * 		schema: z.string().min(1),
 * 	}
 * )
 *
 * function handleSubmit() {
 * 	if (!canSubmit.value) return
 * 	// do something
 * }
 *
 * </script>
 * <template>
 * 	<form @submit.prevent="handleSubmit">
 * 		<InputComponent :valid="inputValid" v-model="value"/>
 * 		<div v-if="errors.length > 0" class="error">
 * 			<div v-for="err in errors">{{ err }}</div>
 * 		</div>
 * 		<div class="sr-only" aria-live="polite" >
 * 			<span v-if="status !== undefined">
 * 				{{ statusText }}
 * 			</span>
 * 		</div>
 * 		<button v-if="canSubmit" @click="handleSubmit">Submit</button>
 * 	</form>
 * </template>
 *
 * ```
 */
export function useAsyncValidation(
	value: Ref<any>,
	asyncDataKey: string,
	checkRoute: string,
	/** Like errors from trying to submit the form if the error regards the value. Will be added to the list of errors. */
	additionalErrors: Ref<string[]> = ref([]),
	{
		debounce = 1000,
		statusTextMap = {
			loading: "Checking....",
			valid: "Valid",
			invalid: "Invalid"
		},
		schema = z.any(),
		formatErrors = (res: StandardSchemaV1.FailureResult) => res.issues.map(err => err.message.replaceAll("✖", "❌")).join("\n")
	}: {
		debounce?: number
		schema?: StandardSchemaV1<string, string>
		formatErrors?: (res: StandardSchemaV1.FailureResult) => string
		statusTextMap?: {
			loading: string
			valid: string
			invalid: string
		}
	} = {}) {
	const debouncedValue = refDebounced(value, debounce)

	const schemaError = computed(() => {
		const result = schema["~standard"].validate(value.value)

		if (result instanceof Promise) {
			throw new TypeError("Async validation schemas are not supported here.")
		}

		if (result.issues) {
			return formatErrors(result)
		}

		return undefined
	})

	const { data: isServerValid, status: requestStatus, error: serverError } = useAsyncData(
		asyncDataKey,
		async () => {
			if (schemaError.value) return false
			return $fetch<boolean>(checkRoute)
		},
		{
			watch: [schemaError, debouncedValue],
			immediate: false,
			default: () => false
		}
	)

	const isLoading = computed(() => {
		return value.value !== "" && (requestStatus.value === "pending" || value.value !== debouncedValue.value)
	})

	const errors = computed(() => {
		const list: string[] = []
		if (schemaError.value) list.push(schemaError.value)
		if (serverError.value) list.push(serverError.value.message || String(serverError.value))
		for (const err of additionalErrors.value) list.push(err)
		return list
	})

	const inputValid = computed(() => {
		return errors.value.length === 0 && (value.value === "" || requestStatus.value === "pending")
	})

	const status = computed<"loading" | "valid" | "invalid" | undefined>(() => {
		if (isLoading.value) return "loading"
		if (errors.value.length > 0 || (!isServerValid.value && value.value !== "")) return "invalid"
		if (isServerValid.value) return "valid"
		return undefined
	})

	const statusText = computed(() => {
		if (!status.value) return ""
		return statusTextMap?.[status.value] ?? ""
	})

	const canSubmit = computed(() => {
		return !isLoading.value && value.value !== "" && errors.value.length === 0 && isServerValid.value
	})

	return {
		errors,
		status,
		statusText,
		canSubmit,
		inputValid,
		/** Available just in case but api might change. */
		_internal: {
			requestStatus,
			serverError,
			isLoading,
			isServerValid
		}
	}
}

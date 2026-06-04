<template>
<DevOnly>
	<slot v-if="doShow && $attrs?.['as-child'] !== undefined"/>
	<!-- never-package class is a for checking our wrapper works as intended -->
	<div
		v-else-if="doShow"
		:class="twMerge(`
			dev-only
			border
			border-dashed
			border-red-500
			px-2
			py-1
			never-packaged
		`,
			($attrs.class as string)
		)"
		v-bind="{ ...$attrs, class: undefined }"
	>
		<slot/>
	</div>
</DevOnly>
</template>

<script lang="ts" setup>
import { twMerge } from "tailwind-merge"
import { computed, ref, useAttrs } from "vue"

import { inject } from "../../../../.nuxt/imports.js"
import { devOnlyHandlerInjectionKey } from "../../types.js"

const $attrs = useAttrs()

const props = withDefaults(defineProps<{
	show?: boolean
}>(), {
	show: false
})

const key = devOnlyHandlerInjectionKey
const handler = inject(key, (ref, e) => {
	if (e.key === "F1") {
		e.preventDefault()
		ref.value = !ref.value
	}
})

const g = window as any
const attachHandler = !g[key]
g[key] ??= {
	show: ref(false),
	handler
}
if (attachHandler) {
	window.addEventListener("keydown", e => handler(g[key].show, e))
}

const doShow = computed(() => props.show || g[key].show.value)
</script>

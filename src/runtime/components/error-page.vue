<template>
<!-- This is client only because the redirect button won't work until hydration otherwise -->
<ClientOnly>
	<!-- @vue-expect-error main layout has special isErrorPage prop -->
	<div class="
		flex
		flex-1
		flex-col
		gap-4
		p-4
		px-10
		pb-20
	"
	>
		<div class="text-2xl text-center">
			{{ error.statusCode }}
		</div>
		<div class="text-xl text-center">
			{{ error.message }}
		</div>
		<div v-if="redirect" class="text-xl flex justify-center items-center gap-4">
			<div class="">
				<span :class="redirecting && `animate-pulse`">
					{{ redirecting ? "Redirecting to " : "Go to " }}
				</span>
				<span class="text-accent-500">
					<NuxtLink :to="redirect">
						{{ redirect }}
					</NuxtLink>
				</span>
			</div>
			<WButton
				v-if="redirecting"
				id="redirect-stop"
				@click="stopRedirect"
			>
				Stop Redirect
			</WButton>
		</div>
		<div class="border-neutral-500 border rounded-sm p-2">
			<div class="text-lg font-bold">
				Error
			</div>
			<pre class="whitespace-pre-wrap break-all">{{
JSON.stringify({ ...error, data, stack: undefined }, null, tab)
			}}</pre>
			<div class="p-3 max-w-full">
				Stack:
				<div class="flex [&_pre]:whitespace-pre-wrap whitespace-pre-wrap break-all">
					<pre>{{ tab }}</pre>
					<pre v-html="error.stack"/>
				</div>
			</div>
		</div>
	</div>
</ClientOnly>
</template>

<script setup lang="ts">

import type { NuxtError } from "#app"
import { clearError, navigateTo } from "#imports"

const props = defineProps<{ error: NuxtError }>()

// nuxt layout not working?
const tab = "\t"

const data: any = props.error.data

const redirect = data && "redirect" in data && typeof data.redirect === "string" && data.redirect

let redirectTimeout: NodeJS.Timeout | undefined
const redirecting = ref(false)

function stopRedirect() {
	redirecting.value = false
	clearTimeout(redirectTimeout!)
}

onMounted(() => {
	if (redirect) {
		redirecting.value = true
		redirectTimeout = setTimeout(() => clearError({ redirect }), 5000)
	}
})
</script>

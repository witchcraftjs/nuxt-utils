<template>
<ClientOnly>
	<DevOnly>
		<!--
		This is a little trick to get nuxt's special DevOnly component to work.
		If we just wrapped our DevOnlyInternal's elements in DevOnly, it would still get included in the bundle.
		It has to wrap the whole component + script to work.
		We also wrap it in a ClientOnly so it's doesn't cause issues on the server.
	-->
		<DevOnlyInternal>
			<slot/>
		</DevOnlyInternal>
	</DevOnly>
</ClientOnly>
</template>

<script setup lang="ts">
import DevOnlyInternal from "./internal/DevOnlyInternal.vue"
</script>

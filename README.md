# @witchcraft/nuxt-utils

Random nuxt or related build utilities that other packages need.

Nuxt only pages/components.

Also optionally extends the base nuxt config with some useful defaults.

# Usage

## Components

### NuxtUtilsErrorPage

Fancier error page with redirect capabilities.

```vue
// app/error.vue
<template>
<NuxtUtilsErrorPage :error="error"/>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>()
</script>


Note that if wrapping in a layout, it needs to use a slot, not a nuxt page or it won't work. You can do something like accept an `isErrorPage` in the layout:

```vue
// app/error.vue
<template>
	<NuxtLayout :isErrorPage="true">
		<NuxtUtilsErrorPage :error="error"/>
	</NuxtLayout>
</template>
```

```vue
// app/layouts/some-layout.vue
<template>
	<NuxtPage v-if="!isErrorPage"/>
	<slot v-else/>
</template>
```

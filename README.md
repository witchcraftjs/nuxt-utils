# @witchcraft/nuxt-utils

[![Release][release-src]][release-href]
[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

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

### NuxtUtilsDevOnly

A better `<DevOnly>` component that hides it's slot by default until you press `F1` to show it.

You can also force show it per component by passing the `show` prop.

```vue
<template>
<NuxtUtilsDevOnly>
	<div>This will only show when you press F1 and will not be included in the bundle.</div>
</NuxtUtilsDevOnly>
</template>
```
The handler is configurable via the exported `devOnlyHandlerInjectionKey` injection key. Note that it is only attached once to the window and never removed. You can't have different handlers in different components. Global data is saved to window with the same injection key.


<!-- Badges -->
[release-src]: https://github.com/witchcraftjs/nuxt-utils/actions/workflows/release.yml/badge.svg
[release-href]: https://github.com/witchcraftjs/nuxt-utils/actions/workflows/release.yml
[npm-version-src]: https://img.shields.io/npm/v/@witchcraft/nuxt-utils/latest
[npm-version-href]: https://www.npmjs.com/package/@witchcraft/nuxt-utils/v/latest
[license-src]: https://img.shields.io/npm/l/@witchcraft/nuxt-utils.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@witchcraft/nuxt-utils
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com

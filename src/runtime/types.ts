import type { InjectionKey, Ref } from "vue"

export const devOnlyHandlerInjectionKey = Symbol.for("@witchcraft/nuxt-utils/dev-only-handler") as InjectionKey<(show: Ref<boolean>, e: KeyboardEvent) => void>

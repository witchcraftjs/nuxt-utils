import path from "node:path"
import type { Nuxt } from "nuxt/schema"

/** Changes the build output dir so the build doesn't interfere with other builds. */
export function nuxtRerouteOutputTo(nuxt: Nuxt, dir: string): void {
	nuxt.hook("nitro:config", config => {
		config.output ??= {}
		config.output.dir = path.join(dir)
		config.output.serverDir = path.join(dir, "server")
		config.output.publicDir = path.join(dir, "public")
	})
}

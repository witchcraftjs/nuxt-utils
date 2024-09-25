import { type NuxtConfig } from "nuxt/schema"
import path from "path"

/** Changes the build output dir so the build doesn't interfere with other builds. */
export function nuxtRerouteOutputTo(dir: string) {
	return {
		nitro: {
			output: {
				dir: path.join(dir),
				// we don't really care about the server for static builds, but it would otherwise overwrite our web build dir
				serverDir: path.join(dir, "server"),
				publicDir: path.join(dir, "public"),
			},
		},
	} satisfies NuxtConfig
}


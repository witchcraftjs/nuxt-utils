import { keys } from "@alanscodelog/utils/keys"
import type { Plugin } from "vite"

export function vitePluginCrossOriginIsolation(headers: Record<string, string>): Plugin {
	return {
		// server.headers doesn't work???
		name: "configure-response-headers",
		configureServer: server => {
			server.middlewares.use((_req, res, next) => {
				for (const key of keys(headers)) {
					if (headers[key] === undefined) continue
					res.setHeader(key, headers[key])
				}
				next()
			})
		}
	}
}

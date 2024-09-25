import { keys } from "@alanscodelog/utils/keys.js"
import { type Plugin } from "vite"


export function vitePluginCrossOriginIsolation(headers: Record<string, string>): Plugin {
	return {
		// server.headers doesn't work???
		name: "configure-response-headers",
		configureServer: server => {
			server.middlewares.use((_req, res, next) => {
				for (const key of keys(headers)) {
					res.setHeader(key, headers[key])
				}
				next()
			})
		},
	}
}

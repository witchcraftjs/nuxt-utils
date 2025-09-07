import {
	addComponent,
	createResolver,
	defineNuxtModule } from "@nuxt/kit"
import { defu } from "defu"
import fs from "node:fs"
import path from "node:path"

// import IconsResolver from "unplugin-icons/resolver"
// import Icons from "unplugin-icons/vite"
// import ViteComponents from "unplugin-vue-components/vite"
import { vitePluginCrossOriginIsolation } from "./buildPlugins/vitePluginCrossOriginIsolation.js"
import { getIps } from "./runtime/utils/getIps.js"

export interface ModuleOptions {
	includeBaseConfig: boolean | ("base" | "security")[]
}

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: "nuxtUtils",
		configKey: "nuxtUtils"
	},
	defaults: {
		includeBaseConfig: true
	},
	async setup(options, nuxt) {
		// const logger = useLogger("@witchcraft/nuxt-utils")
		const { resolvePath, resolve } = createResolver(import.meta.url)
		const rootDir = await resolvePath("~~/", nuxt.options.alias)
		const ignoreDirs = [
			...fs.readdirSync(rootDir).filter(file =>
				file.startsWith(".")
				&& fs.statSync(path.resolve(rootDir, file)).isDirectory()
				// if we ignore it I think we interfere with hmr
				&& file !== ".nuxt"
			),
			"build",
			"helpers",
			"tests"
		].map(dir => [`${dir}`]).flat()
		const nuxtOptions = nuxt.options as any

		const include = options.includeBaseConfig === true
			? ["base", "security"]
			: options.includeBaseConfig === false
				? []
				: options.includeBaseConfig

		if (include.includes("base")) {
			nuxt.options.ignore ??= defu(ignoreDirs, nuxt.options.ignore)
			nuxt.options.nitro ??= defu(
				{
					experimental: {
						websocket: true
					}
				},
				(nuxt.options.nitro as any) ?? {}
			)
			nuxt.options.devtools ??= defu(
				{
					enabled: true
				},
				(nuxt.options.devtools as any) ?? {}
			)
			nuxt.options.typescript ??= defu(
				{
					tsConfig: {
						compilerOptions: {
							lib: ["es2021", "dom"],
							importsNotUsedAsValues: "remove"
						},
						vueCompilerOptions: {
							strictTemplates: true
						}
					}
				},
				((nuxt.options.typescript as any) ?? {})
			) as any
		}

		nuxt.hook("build:manifest", (manifest: any) => {
			for (const key of Object.keys(manifest)) {
				manifest[key].dynamicImports = []

				const file = manifest[key]
				file.assets &&= file.assets.filter(
					(assetName: string) => !/.+\.(?:gif|jpe?g|png|svg)$/.test(assetName)
				)
			}
		})
		nuxt.hook("vite:extendConfig", config => {
			config.vue ??= {}
			config.vue.script ??= {}
			config.vue.script.defineModel ??= true
		})

		if (include.includes("security") && nuxt.options.modules.includes("nuxt-security")) {
			nuxt.options.vite ??= {}
			nuxt.options.vite.plugins ??= []
			nuxt.options.vite.plugins.push(vitePluginCrossOriginIsolation(
				{
					"Cross-Origin-Embedder-Policy": "require-corp",
					"Cross-Origin-Opener-Policy": "same-origin",
					"Access-Control-Allow-Origin": "*"
				}
			) as any)

			nuxtOptions.security ??= {}
			nuxtOptions.security.corsHandler ??= {}
			nuxtOptions.security.corsHandler.origin ??= process.env.NODE_ENV !== "production"
				? [
						"http://localhost:3000",
						"http://localhost",
						"https://localhost:3000",
						"https://localhost",
						`https://${getIps()[0]!.ips[0]}:3000`
					]
				: []
		}

		addComponent({
			name: "NuxtUtilsErrorPage",
			filePath: resolve("runtime/components/error-page.vue"),
			global: true
		})
		nuxt.options.alias["#nuxt-utils"] = resolve("runtime")
	}
})

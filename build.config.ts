import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
	entries: [
		"./src/ensureEnv.ts",
		{
			builder: "mkdist",
			input: "./src/runtime/**/",
			outDir: "./dist/runtime/**/",
			ext: "js",
		},
	],
})

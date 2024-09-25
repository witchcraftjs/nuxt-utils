import fastGlob from "fast-glob"
import path from "path"

export function globFiles<T = { name: string, filepath: string }>(
	globs: string[],
	ignore: string[],
	cb: (filepath: string, name: string) => T = (filepath,name) => ({ name, filepath } as T),
	{ defaultIgnores = true }: { defaultIgnores?: boolean } = {},
): T[] {
	const imports = fastGlob.globSync(
		globs,
		{
			onlyFiles: true,
			ignore: [
				...(defaultIgnores ? [
					"**/index.*",
					"**/*.d.ts",
					"**/*.stories.*",
				] : []),
				...ignore,
			],
			absolute: true,
		}
	)
	const res = []
	for (const imp of imports) {
		const name = path.parse(imp).name
		res.push(cb(imp, name))
	}
	return res
}

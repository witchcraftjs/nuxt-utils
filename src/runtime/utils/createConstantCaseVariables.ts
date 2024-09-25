import { constantCase } from "change-case"


export const createConstantCaseVariables = (
	vars: Record<string, any>,
	prefix: string = "process.env.",
	{autoquote = true}: { autoquote?: boolean } = {},
): Record<string, any> =>
	Object.fromEntries(
		Object.keys(vars)
			.map(key => {
				const finalKey = prefix + constantCase(key)
				const finalValue = typeof vars[key] === "object"
					? `'${JSON.stringify(vars[key])}'`
					: autoquote ? `'${vars[key]}'` : vars[key]
				return [finalKey, finalValue]
			}
			)
	)


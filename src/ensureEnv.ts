/**
	* Asserts env variables exist in process.env so they can be used without type casting shenanigans.
	*
	* Note that the keys must be passes as `[key1, key2, ...]` as const` for the type assertion to work.
	*
	* Can be disabled by passing false to the third argument. This can be useful when building modules which set defaults to env variables because at the time of build the env variables don't have to exist.
	*/
export function ensureEnv<
	TKeys extends readonly string[],
>(
	env: Record<string, string | undefined>,
	keys: TKeys,
	disable: boolean | string = false,
): asserts env is Record<TKeys[number], string> {
	if (disable) return
	const missingKeys = keys.filter(key => env[key] === undefined)
	if (missingKeys.length > 0) {
		throw new Error(`Missing environment variables: ${missingKeys.join(",")}.`)
	}
}

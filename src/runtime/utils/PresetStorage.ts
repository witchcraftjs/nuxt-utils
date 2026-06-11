import { pushIfNotIn } from "@alanscodelog/utils/pushIfNotIn"
import { Err, Ok, type Result } from "@alanscodelog/utils/Result"
import { setReadOnly } from "@alanscodelog/utils/setReadOnly"
import { z } from "zod"

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IPresetStorage<TRaw> {
	setItem: (key: string, value: TRaw) => Promise<void> | void
	getItem: (key: string) => Promise<TRaw | null> | (TRaw | null)
	removeItem: (key: string) => Promise<void> | void
	getKeys: () => Promise<string[]> | string[]
}

/**
 * Class for managing presets of any type using storage of any type.
 *
 * ```ts
 *
 * import { createStorage } from "unstorage"
 * import localStorageDriver from "unstorage/drivers/localstorage"
 * const storage = createStorage({ driver: localStorageDriver() })
 *
 * const manager = new PresetManager<string, User>({
 *     keys: {
 *         active: 'myapp:users:activeUser',
 *         presetPrefix: 'myapp:users:'
 *     },
 *     presetValidator: (value) => {
 *         if (typeof value === 'string') {
 *             const json = jsonSafeParse(value ?? 'null')
 *             if (json.isOk) return zUser.safeParse(json.value)
 *             return { success: false, error: json.error }
 *         }
 *         if (typeof value === 'object') return zUser.safeParse(value)
 *         return { success: false, error: new Error('Unknown type') }
 *     },
 *     defaultPreset: {
 *         name: 'default',
 *         getValue: () => ({ id: '', name: '' })
 *     },
 *     storage
 * })
 *
 * await manager.init()
 *
 * // save a preset
 * await manager.savePreset('alice', { id: '1', name: 'Alice' })
 *
 * // switch to a preset
 * await manager.changePreset('alice')
 *
 * // list all presets
 * console.log(manager.presetNames)
 *
 * // extend the class for domain-specific methods
 * class UserPresetManager extends PresetManager<string, User> {
 *     async getUser(id: string): Promise<User> {
 *         const preset = await this.loadPreset(id)
 *         if (!preset.isOk || preset.value === undefined)
 *             throw new Error(`User ${id} not found`)
 *         return preset.value
 *     }
 * }
 */
export class PresetManager<
	TRawValue extends string | object = string | object,
	TValue = TRawValue
> {
	readonly presetNames: string[] = []

	// as long as the class is initialized, they will both be defined
	readonly activePresetName: string = ""

	readonly activePreset: TValue = undefined as any

	storage: IPresetStorage<TRawValue>

	keys: { active: string, presetPrefix: string }

	presetValidator: (value: TRawValue | null) => { data: TValue, success: true } | { error: Error, success: false }

	presetNameValidator: ((name: string) => { data: string, success: true } | { success: false, error: Error })
		= z
			.string().min(1).max(50)
			.regex(/^[\w\- ]+$/)
			.safeParse

	defaultPreset: {
		name: string
		getValue: () => TValue
	}

	convertForStorage: (value: TValue) => TRawValue = (value: any) => JSON.stringify(value) as any

	listeners: {
		["change:active"]: ((name: string) => void)[]
		["change:list"]: ((names: string[]) => void)[]
	} = {
		"change:active": [],
		"change:list": []
	}

	constructor(
		opts: {
			storage: IPresetStorage<TRawValue>
			keys: PresetManager<TRawValue, TValue>["keys"]
			presetValidator: PresetManager<TRawValue, TValue>["presetValidator"]
			presetNameValidator?: PresetManager<TRawValue, TValue>["presetNameValidator"]
			defaultPreset: PresetManager<TRawValue, TValue>["defaultPreset"]
			convertForStorage?: PresetManager<TRawValue, TValue>["convertForStorage"]
		}
	) {
		this.storage = opts.storage
		this.keys = opts.keys
		this.presetValidator = opts.presetValidator as any
		if (opts.presetNameValidator) this.presetNameValidator = opts.presetNameValidator as any
		this.defaultPreset = opts.defaultPreset
	}

	/**
	 * Initialize the preset manager. Checks the storage keys for valid entries and loads matching names into `presetNames`. Also attempts to load the active preset into `activePreset`. Falls back to the default preset.
	 *
	 * Optionally validates them, though it is better to validate on load instead.
	 *
	 * This function can be called multiple times if needed.
	 */
	async init(
		{ loadAndValidate = true }: {
			loadAndValidate?: boolean
		} = {}
	) {
		const possibleKeys = await this.storage.getKeys()
		const possiblePresets = []
		const presetNames: string[] = []
		await Promise.all(possibleKeys.map(async fullKey => {
			if (fullKey.startsWith(this.keys.presetPrefix)) {
				const key = fullKey.slice(this.keys.presetPrefix.length)
				if (loadAndValidate) {
					const parsed = this.presetValidator(await this.storage.getItem(fullKey))
					if (parsed.success) {
						possiblePresets.push(parsed.data)
						presetNames.push(key)
					}
				} else {
					presetNames.push(key)
				}
			}
		}))
		await this._saveAvailablePresets(presetNames)

		const activePreset = await this.storage.getItem(this.keys.active)
		if (activePreset && typeof activePreset === "string") {
			return this.changePreset(activePreset)
		} else {
			return this.changePreset(this.defaultPreset.name, { createIfNotExists: true })
		}
	}

	addEventListener<TType extends "change:active" | "change:list">(
		type: TType,
		listener: PresetManager<TRawValue, TValue>["listeners"][TType][number]
	) {
		this.listeners[type].push(listener as any)
	}

	removeEventListener<TType extends "change:active" | "change:list">(
		type: TType,
		listener: PresetManager<TRawValue, TValue>["listeners"][TType][number]
	) {
		const index = this.listeners[type].indexOf(listener as any)
		if (index > -1) {
			this.listeners[type].splice(index, 1)
		}
	}

	private async _saveActivePresetName(
		presetName: string
	): Promise<Result<undefined, Error>> {
		await this.storage.setItem(this.keys.active, presetName as TRawValue)
		if (presetName === this.activePresetName) return Ok()

		setReadOnly(this, "activePresetName", presetName)
		for (const listener of this.listeners["change:active"]) {
			listener(presetName)
		}
		return Ok()
	}

	private async _saveAvailablePresets(
		presets: string[]
	): Promise<Result<undefined, Error>> {
		if (this.presetNames === presets) return Ok()
		if (this.presetNames.length === presets.length && !presets.some(p => !this.presetNames.includes(p))) return Ok()
		setReadOnly(this, "presetNames", presets)

		for (const listener of this.listeners["change:list"]) {
			listener(presets)
		}
		return Ok()
	}

	private _assertValidPresetName(name: string) {
		const parsed = this.presetNameValidator(name)
		if (!parsed.success) {
			throw parsed.error
		}
	}

	async changePreset(
		presetName: string,
		{ createIfNotExists = true } = {}
	): Promise<Result<TValue, Error>> {
		const entry = await this.loadPreset(presetName)

		if (entry.isOk) {
			if (entry.value === undefined) {
				if (!createIfNotExists) return Err(new Error(`Preset ${presetName} not found`))
				const defaultValue = this.defaultPreset.getValue()
				const res = await this.savePreset(presetName, defaultValue)
				setReadOnly(this, "activePreset", defaultValue)
				await this._saveActivePresetName(presetName)
				return res.isError ? res : Ok(defaultValue)
			} else {
				// we handled undefined above
				return entry as Result<NonNullable<TValue>, Error>
			}
		}
		return entry // Err
	}

	async loadPreset(presetName: string): Promise<Result<TValue | undefined, Error>> {
		const entry = (await this.storage.getItem(this.keys.presetPrefix + presetName))
		this._assertValidPresetName(presetName)
		if (entry) {
			const parsed = this.presetValidator(entry)
			if (parsed.success) {
				setReadOnly(this, "activePreset", parsed.data)
				await this._saveActivePresetName(presetName)
				return Ok(parsed.data)
			} else {
				return Err(parsed.error)
			}
		} else {
			return Ok(undefined)
		}
	}

	async savePreset(
		presetName: string,
		presetValue: TValue
	): Promise<Result<undefined, Error>> {
		this._assertValidPresetName(presetName)
		// prevent incorrect code from saving something that later can't be loaded
		const parsed = this.presetValidator(presetValue as any)
		if (!parsed.success) return Err(parsed.error)
		const value = this.convertForStorage(parsed.data)
		await this.storage.setItem(this.keys.presetPrefix + presetName, value)
		const newNames = pushIfNotIn([], this.presetNames, [presetName])
		newNames.sort()
		await this._saveAvailablePresets(newNames)
		return Ok()
	}

	async removePreset(
		presetName: string
	): Promise<Result<undefined, Error>> {
		this._assertValidPresetName(presetName)
		try {
			await this.storage.removeItem(this.keys.presetPrefix + presetName)
		} catch (e) {
			if (e instanceof Error) return Err(e)
			else throw e
		}
		await this._saveAvailablePresets(this.presetNames.toSpliced(this.presetNames.indexOf(presetName), 1))
		if (this.activePresetName === presetName) {
			await this.changePreset(this.defaultPreset.name, { createIfNotExists: true })
		}
		return Ok()
	}

	async clearPresets(): Promise<Result<undefined, Error>[]> {
		const keys = await this.storage.getKeys()

		const res = await Promise.all(keys.map(async k => {
			if (k.startsWith(this.keys.presetPrefix)) {
				return this.removePreset(k.replace(this.keys.presetPrefix, ""))
			}
			return Ok()
		}))
		await this._saveAvailablePresets([])
		await this.changePreset(this.defaultPreset.name, { createIfNotExists: true })

		return res
	}

	async getAllPresets<TIgnoreUndefined extends boolean = false>({
		ignoreUndefined = true as TIgnoreUndefined
	}: { ignoreUndefined?: TIgnoreUndefined } = {}): Promise<
		TIgnoreUndefined extends true
			? Record<string, NonNullable<TValue>>
			: Record<string, TValue | undefined>
	> {
		const presets = this.presetNames
		const res: Record<string, TValue | undefined> = {}
		for (const preset of presets) {
			const item = await this.loadPreset(preset)
			if (ignoreUndefined && item.isOk && item.value === undefined) {
				continue
			}
			res[preset] = item.value
		}
		return res as any
	}
}

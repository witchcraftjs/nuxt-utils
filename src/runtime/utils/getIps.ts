import { keys } from "@alanscodelog/utils/keys.js"
import { networkInterfaces } from "os"


export function getIps() {
	const nets = networkInterfaces()
	return keys(nets).map(name => {
		const ips = nets[name]!.map(net => {
			if (net.family === "IPv4" && !net.internal) {
				return net.address
			}
			return undefined
		}).filter(entry => entry !== undefined)
		return { name, ips }
	}).filter(entries => entries.ips.length !== 0)
}

import { keys } from "@alanscodelog/utils/keys"
import { networkInterfaces } from "node:os"

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

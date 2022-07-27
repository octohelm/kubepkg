package idgen

import (
	"net"
	"os"
)

func ResolveExposedIP() net.IP {
	hostname, _ := os.Hostname()
	if hostname == "" {
		hostname = os.Getenv("HOSTNAME")
	}

	for _, host := range []string{hostname, "localhost"} {
		addrList, _ := net.LookupIP(host)

		for i := range addrList {
			addr := addrList[len(addrList)-1-i]

			if ipv4 := addr.To4(); ipv4 != nil {
				return ipv4
			}
		}
	}

	return nil
}

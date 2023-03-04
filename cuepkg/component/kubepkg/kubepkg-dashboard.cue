package kubepkg

import (
	kubepkg "github.com/octohelm/kubepkg/cuepkg/kubepkg"
)

#KubepkgDashboard: kubepkg.#KubePkg & {
	metadata: {
		name: string | *"kubepkg-dashboard"
	}
	spec: {
		version: _

		deploy: {
			kind: "Deployment"
			spec: replicas: _ | *1
		}

		config: "KUBEPKG_LOG_LEVEL":                   string | *"info"
		config: "KUBEPKG_LOG_FILTER":                  string | *"Always"
		config: "KUBEPKG_TRACE_COLLECTOR_ENDPOINT":    string | *""
		config: "KUBEPKG_SIGN_ISSUER":                 string | *"kubepkg.octohelm.tech"
		config: "KUBEPKG_SIGN_PRIVATE_KEY":            string | *"LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlDWFFJQkFBS0JnUUN4d2hFUDhXUDBQc0NXTEVSaTdBOGE5V29lejZ2dTBudjRFWExUeFEwV2F0RlAvakpLCnY4VTkxL0NWT2Mzc0FmeTZiWC94U3ExVEs4SEMrOWEyZm1BNlpXREZHVk8yMjU1VGxrb0g4ZEtnUnU2cGwrN1cKNllySTdaajcwU1ZoS3VzUitRTktueTFINDFJL1VCWkMrUnVRWjZQNUVPN0lOWm9kVzcvT0ZOL1Bhd0lEQVFBQgpBb0dBV05zaG5FNldJR21kNjNPRlc4MlVYMjE5OXBqbzRTRG1SMEt4bTVwTXlIL3MwWWZIckFYZ211RnVxYW1UCmZmNGdUekNkWEFod1M3cjd5SFFMQ0g1enF1ZnRUNFBhWXJJRkEvK2cwaE13bkpMcUovZGZjS1dVTEZLaFRCVUcKNnM3NjRxZy9wWWtYbW14L2dLVFdUYlBCSkxzOEtPZFNoRVYySjA1TUN1djJFNEVDUVFEVkhLNm9wYVIwbEI4ZQphaVJaYVIxajd1bzZZd1dpVGNkbGowdlhyQ1ZJN1RHQ2RsRzZ3amYwV25hZ0lWc2d6VVNzOUxvVWpBQVhhTU1xCmVCUWpmT0JUQWtFQTFZZjd6TEFGYldzdWZqYWxuSVJsQ2hTNjZqWEwzTnkzdGRGUEJzUVE0NEtWZTVpdURrTm0KYkN2QnB0WnczTURoNjFDQXlZakRUZTk4aW9hYmIzalJpUUpCQUxaLzhJYVdDMGFXVGl2aW82dzUyeVJvUmdlbwpJdndCOVg3Z2Z3ZDc4UllKb2Z0aVRjMU1ZMVNMWDhqenA3Rm9kNlpSa1VUbE8zTFFrVW0rT1NqRzJPY0NRUUNrCkkvWHhjRldidU1weWh2dGpoM3BMOTRkL1JuOUJkZ0ZhS0YyQksvSjNrUWZyaklBdndxdlc5d1BUaGdBWUVjVVkKcURkM3RFTzlneHpQTjQ0QWNIVlJBa0JPS3hYakNGdVFSUlJUUnFhZjYyalNoWHlZUy9mRUJWMzZJVy9TcS90bwpxbmk5UWVzbmZUaUpMcUFyRTAxbjZtWU1JRDRHODBXV2todzhSWHBHOFl3aQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo="
		config: "KUBEPKG_AUTH_REDIRECT_URI":           string | *"/authorize/callback/{name}"
		config: "KUBEPKG_AUTH_AUTO_CREATED_BY":        string | *"oidc"
		config: "KUBEPKG_AUTH_PROVIDER_OIDC_ENDPOINT": string | *""
		config: "KUBEPKG_DB_ENDPOINT":                 string
		config: "KUBEPKG_DB_ENABLE_MIGRATE":           string | *"false"
		config: "KUBEPKG_ENABLE_DEBUG":                string | *"false"

		services: "#": {
			ports: containers."kubepkg-dashboard".ports
		}

		containers: "kubepkg-dashboard": {

			ports: "http": _ | *80

			env: "KUBEPKG_ADDR": _ | *":\(ports."http")"

			readinessProbe: {
				httpGet: {
					path:   "/"
					port:   ports."http"
					scheme: "HTTP"
				}
				initialDelaySeconds: _ | *5
				timeoutSeconds:      _ | *1
				periodSeconds:       _ | *10
				successThreshold:    _ | *1
				failureThreshold:    _ | *3
			}
			livenessProbe: readinessProbe
		}

		containers: "kubepkg-dashboard": {
			image: {
				name: _ | *"ghcr.io/octohelm/kubepkg"
				tag:  _ | *"\(version)"
			}

			args: [
				"serve", "dashboard",
			]
		}
	}
}

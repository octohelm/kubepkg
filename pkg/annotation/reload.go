package annotation

import (
	"fmt"
)

const Reload = "reload.octohelm.tech"
const ReloadHash = "reload.octohelm.tech/hash"
const ReloadSecret = "reload.octohelm.tech/secret"
const ReloadConfigMap = "reload.octohelm.tech/configmap"

func ConfigMapHashKey(name string) string {
	return fmt.Sprintf("octohelm.tech/configmap.%s.hash", name)
}

func SecretHashKey(name string) string {
	return fmt.Sprintf("octohelm.tech/secret.%s.hash", name)
}

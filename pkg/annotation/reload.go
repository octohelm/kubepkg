package annotation

import (
	"fmt"
)

const Reload = "reload.octohelm.tech"
const ReloadHash = "reload.octohelm.tech/hash"
const ReloadSecret = "reload.octohelm.tech/secret"
const ReloadConfigMap = "reload.octohelm.tech/configmap"

// https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/#syntax-and-character-set
// <prefix>/<name-part>
func ConfigMapHashKey(name string) string {
	return fmt.Sprintf("hash.configmap.octohelm.tech/%s", name)
}

func SecretHashKey(name string) string {
	return fmt.Sprintf("hash.secret.octohelm.tech/%s", name)
}

package cmd

type Storage struct {
	Root string `flag:"storage-root,w" default:".tmp/kubepkg" env:"KUBEPKG_STORAGE_ROOT" desc:"storage dir root"`
}

type RemoteRegistry struct {
	Endpoint string `flag:"remote-registry-endpoint" default:"" env:"KUBEPKG_REMOTE_REGISTRY_ENDPOINT" desc:"remote container registry endpoint"`
	Username string `flag:"remote-registry-username" default:"" env:"KUBEPKG_REMOTE_REGISTRY_USERNAME" desc:"remote container registry username"`
	Password string `flag:"remote-registry-password" default:"" env:"KUBEPKG_REMOTE_REGISTRY_PASSWORD" desc:"remote container registry password"`
}

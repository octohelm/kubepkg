package controller

type HostOptions struct {
	InternalHost           string `flag:"internal-host" env:"INTERNAL_HOST" desc:"cluster hostname or ip for internal access"`
	ExternalHost           string `flag:"external-host" env:"EXTERNAL_HOST" desc:"cluster hostname or ip for external access"`
	EnableHttps            bool   `flag:"enable-https" env:"ENABLE_HTTPS" desc:"https enabled or not"`
	EnableAutoInternalHost bool   `flag:"enable-auto-internal-host" env:"ENABLE_AUTO_INTERNAL_HOST" desc:"When enabled, all service http 80 will bind internal host"`
}

type Options struct {
	HostOptions
}

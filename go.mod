module github.com/octohelm/kubepkg

go 1.21

replace github.com/distribution/distribution/v3 => github.com/distribution/distribution/v3 v3.0.0-20230808081639-69fe1690134c

replace github.com/prometheus/prometheus => github.com/prometheus/prometheus v0.47.2
// FIXME remove until prometheus@v0.48.0 reelease
replace golang.org/x/exp => golang.org/x/exp v0.0.0-20230713183714-613f0c0eb8a1

require (
	cuelang.org/go v0.6.0
	github.com/containerd/containerd v1.7.8
	github.com/coreos/go-oidc/v3 v3.7.0
	github.com/davecgh/go-spew v1.1.2-0.20180830191138-d8f796af33cc
	github.com/distribution/distribution/v3 v3.0.0-20230808081639-69fe1690134c
	github.com/docker/libtrust v0.0.0-20160708172513-aabc10ec26b7
	github.com/go-courier/logr v0.3.0
	github.com/go-courier/snowflakeid v1.2.1
	github.com/go-logr/logr v1.3.0
	github.com/go-rod/rod v0.112.2
	github.com/google/uuid v1.4.0
	github.com/innoai-tech/infra v0.0.0-20231108020032-bb4d4fac418c
	github.com/lestrrat-go/jwx/v2 v2.0.16
	github.com/mattn/go-colorable v0.1.13
	github.com/mattn/go-isatty v0.0.20
	github.com/octohelm/courier v0.0.0-20231106005111-1d99c5428a91
	github.com/octohelm/gengo v0.0.0-20230809023313-1339e47458a4
	github.com/octohelm/storage v0.0.0-20231008100801-8ce5ff9d2b8d
	github.com/octohelm/x v0.0.0-20231011022240-331d250f40ae
	github.com/opencontainers/go-digest v1.0.0
	github.com/opencontainers/image-spec v1.1.0-rc5
	github.com/pkg/errors v0.9.1
	github.com/pquerna/otp v1.4.0
	github.com/sirupsen/logrus v1.9.3
	github.com/stretchr/objx v0.5.1
	github.com/tidwall/gjson v1.17.0
	golang.org/x/crypto v0.15.0
	golang.org/x/mod v0.14.0
	golang.org/x/net v0.18.0
	golang.org/x/oauth2 v0.14.0
	golang.org/x/sync v0.5.0
	k8s.io/api v0.28.3
	k8s.io/apiextensions-apiserver v0.28.3
	k8s.io/apimachinery v0.28.3
	k8s.io/client-go v0.28.3
	k8s.io/kube-openapi v0.0.0-20231010175941-2dd684a91f00
	k8s.io/utils v0.0.0-20230726121419-3b25d923346b
	sigs.k8s.io/controller-runtime v0.16.3
	sigs.k8s.io/controller-tools v0.13.0
	sigs.k8s.io/yaml v1.4.0
)

require (
	github.com/Azure/azure-sdk-for-go/sdk/azcore v1.9.0 // indirect
	github.com/Azure/azure-sdk-for-go/sdk/azidentity v1.4.0 // indirect
	github.com/Azure/azure-sdk-for-go/sdk/internal v1.5.0 // indirect
	github.com/AzureAD/microsoft-authentication-library-for-go v1.2.0 // indirect
	github.com/Microsoft/hcsshim v0.11.4 // indirect
	github.com/alecthomas/units v0.0.0-20211218093645-b94a6e3cc137 // indirect
	github.com/andybalholm/brotli v1.0.6 // indirect
	github.com/asaskevich/govalidator v0.0.0-20230301143203-a9d515a09cc2 // indirect
	github.com/aws/aws-sdk-go v1.47.7 // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/boombuler/barcode v1.0.1 // indirect
	github.com/cenkalti/backoff/v4 v4.2.1 // indirect
	github.com/cespare/xxhash/v2 v2.2.0 // indirect
	github.com/cockroachdb/apd/v3 v3.2.1 // indirect
	github.com/containerd/log v0.1.0 // indirect
	github.com/decred/dcrd/dcrec/secp256k1/v4 v4.2.0 // indirect
	github.com/dennwc/varint v1.0.0 // indirect
	github.com/docker/go-events v0.0.0-20190806004212-e31b211e4f1c // indirect
	github.com/docker/go-metrics v0.0.1 // indirect
	github.com/dustin/go-humanize v1.0.1 // indirect
	github.com/edsrzf/mmap-go v1.1.0 // indirect
	github.com/emicklei/go-restful/v3 v3.11.0 // indirect
	github.com/evanphx/json-patch/v5 v5.7.0 // indirect
	github.com/felixge/httpsnoop v1.0.4 // indirect
	github.com/fsnotify/fsnotify v1.7.0 // indirect
	github.com/go-jose/go-jose/v3 v3.0.1 // indirect
	github.com/go-kit/log v0.2.1 // indirect
	github.com/go-logfmt/logfmt v0.6.0 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/go-openapi/jsonpointer v0.20.0 // indirect
	github.com/go-openapi/jsonreference v0.20.2 // indirect
	github.com/go-openapi/swag v0.22.4 // indirect
	github.com/gobuffalo/flect v1.0.2 // indirect
	github.com/goccy/go-json v0.10.2 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang-jwt/jwt/v5 v5.1.0 // indirect
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/golang/protobuf v1.5.3 // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/gomodule/redigo v1.8.9 // indirect
	github.com/google/gnostic v0.7.0 // indirect
	github.com/google/gnostic-models v0.6.9-0.20230804172637-c7be7c783f49 // indirect
	github.com/google/go-cmp v0.6.0 // indirect
	github.com/google/gofuzz v1.2.0 // indirect
	github.com/gorilla/handlers v1.5.2 // indirect
	github.com/gorilla/mux v1.8.1 // indirect
	github.com/grafana/regexp v0.0.0-20221122212121-6b5c0a4cb7fd // indirect
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.18.1 // indirect
	github.com/hashicorp/golang-lru v1.0.2 // indirect
	github.com/imdario/mergo v0.3.16 // indirect
	github.com/inconshreveable/mousetrap v1.1.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20221227161230-091c0ba34f0a // indirect
	github.com/jackc/pgx/v5 v5.5.0 // indirect
	github.com/jackc/puddle/v2 v2.2.1 // indirect
	github.com/jmespath/go-jmespath v0.4.0 // indirect
	github.com/josharian/intern v1.0.0 // indirect
	github.com/jpillora/backoff v1.0.0 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/julienschmidt/httprouter v1.3.0 // indirect
	github.com/kballard/go-shellquote v0.0.0-20180428030007-95032a82bc51 // indirect
	github.com/klauspost/compress v1.17.2 // indirect
	github.com/kylelemons/godebug v1.1.0 // indirect
	github.com/lestrrat-go/blackmagic v1.0.2 // indirect
	github.com/lestrrat-go/httpcc v1.0.1 // indirect
	github.com/lestrrat-go/httprc v1.0.4 // indirect
	github.com/lestrrat-go/iter v1.0.2 // indirect
	github.com/lestrrat-go/option v1.0.1 // indirect
	github.com/mailru/easyjson v0.7.7 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.4 // indirect
	github.com/matttproud/golang_protobuf_extensions/v2 v2.0.0 // indirect
	github.com/mitchellh/mapstructure v1.5.0 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/mpvl/unique v0.0.0-20150818121801-cbe035fff7de // indirect
	github.com/munnerz/goautoneg v0.0.0-20191010083416-a7dc8b61c822 // indirect
	github.com/mwitkow/go-conntrack v0.0.0-20190716064945-2f068394615f // indirect
	github.com/oklog/ulid v1.3.1 // indirect
	github.com/onsi/gomega v1.30.0 // indirect
	github.com/pkg/browser v0.0.0-20210911075715-681adbf594b8 // indirect
	github.com/pmezard/go-difflib v1.0.1-0.20181226105442-5d4384ee4fb2 // indirect
	github.com/prometheus/client_golang v1.17.0 // indirect
	github.com/prometheus/client_model v0.5.0 // indirect
	github.com/prometheus/common v0.45.0 // indirect
	github.com/prometheus/common/sigv4 v0.1.0 // indirect
	github.com/prometheus/procfs v0.12.0 // indirect
	github.com/prometheus/prometheus v0.47.2 // indirect
	github.com/remyoudompheng/bigfft v0.0.0-20230129092748-24d4a6f8daec // indirect
	github.com/segmentio/asm v1.2.0 // indirect
	github.com/spf13/cobra v1.8.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/stretchr/testify v1.8.4 // indirect
	github.com/tidwall/match v1.1.1 // indirect
	github.com/tidwall/pretty v1.2.1 // indirect
	github.com/ysmood/goob v0.4.0 // indirect
	github.com/ysmood/gson v0.7.3 // indirect
	github.com/ysmood/leakless v0.8.0 // indirect
	go.opentelemetry.io/contrib/propagators/b3 v1.20.0 // indirect
	go.opentelemetry.io/otel v1.19.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/internal/retry v1.17.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlpmetric v0.42.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc v0.42.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.19.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc v1.19.0 // indirect
	go.opentelemetry.io/otel/exporters/prometheus v0.42.0 // indirect
	go.opentelemetry.io/otel/metric v1.19.0 // indirect
	go.opentelemetry.io/otel/sdk v1.19.0 // indirect
	go.opentelemetry.io/otel/sdk/metric v1.19.0 // indirect
	go.opentelemetry.io/otel/trace v1.19.0 // indirect
	go.opentelemetry.io/proto/otlp v1.0.0 // indirect
	go.uber.org/atomic v1.11.0 // indirect
	go.uber.org/goleak v1.3.0 // indirect
	golang.org/x/exp v0.0.0-20231108232855-2478ac86f678 // indirect
	golang.org/x/sys v0.14.0 // indirect
	golang.org/x/term v0.14.0 // indirect
	golang.org/x/text v0.14.0 // indirect
	golang.org/x/time v0.4.0 // indirect
	golang.org/x/tools v0.15.0 // indirect
	gomodules.xyz/jsonpatch/v2 v2.4.0 // indirect
	google.golang.org/appengine v1.6.8 // indirect
	google.golang.org/genproto/googleapis/api v0.0.0-20231106174013-bbf56f31fb17 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20231106174013-bbf56f31fb17 // indirect
	google.golang.org/grpc v1.59.0 // indirect
	google.golang.org/protobuf v1.31.0 // indirect
	gopkg.in/inf.v0 v0.9.1 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
	k8s.io/component-base v0.28.3 // indirect
	k8s.io/klog/v2 v2.110.1 // indirect
	lukechampine.com/uint128 v1.3.0 // indirect
	modernc.org/cc/v3 v3.41.0 // indirect
	modernc.org/ccgo/v3 v3.16.15 // indirect
	modernc.org/libc v1.31.0 // indirect
	modernc.org/mathutil v1.6.0 // indirect
	modernc.org/memory v1.7.2 // indirect
	modernc.org/opt v0.1.3 // indirect
	modernc.org/sqlite v1.27.0 // indirect
	modernc.org/strutil v1.2.0 // indirect
	modernc.org/token v1.1.0 // indirect
	sigs.k8s.io/json v0.0.0-20221116044647-bc3834ca7abd // indirect
	sigs.k8s.io/structured-merge-diff/v4 v4.4.1 // indirect
)

# Operator for kubepkg

## Requires

* Docker Image only support v2
* k3s/k8s 1.22+

## `kubepkg.tgz`

```
kubepkg.json # must be first of all
blobs/ # blob contents
  <alg>/
    <hash> 
```

### `kubepkg.json`

```typescript
interface KubePkg {
    apiVersion: "octohelm.tech/v1alpha1"
    kind: "KubePkg"
    metadata: {
        name: string
    }
    spec: {
        // semver for upgrade checking
        version: string
        // manifests of k8s
        manifests: {
            // "<metadata.name>.<kind>.<apiGroup>"
            [key: string]: {
                apiVersion: string,
                kind: string,
                [x: string]: any
            }
        }
        // images with tag may with digest
        // when digest exists, tag the digest instead of pulling always
        images: { [imagetag: string]: string | "" }
    }
    statuses: {}
}
```

# KubePkg

```mermaid
%%{init:{'theme':'base'}}%%
flowchart BT
    subgraph internet ["Internet"]
        kubepkg_manifest("KubePkg.yaml")
        kubepkg_airgap("KubePkg.airgap.tgz")
    end
    
    subgraph intranet ["Intranet"]
        kubepkg_airgap_intranet("KubePkg.airgap.tgz")
        
        subgraph cluster ["k8s/k3s cluster"]
            kubepkg_agent(("KubePkg\nAgent"))
            kubepkg_registry[("KubePkg\nRegistry")]
            kubepkg_crd[["KubePkg CRD"]]
            kubepkg_operator(("KubePkg\nOperator"))
            k8s_manifests[["Kuberneters\nManifests"]]
        end
    end
    
    kubepkg_manifest
        ==> |`kubepkg save`| kubepkg_airgap 
        -.-> kubepkg_airgap_intranet
        ==> |`kubepkg import`| kubepkg_agent    
    
    kubepkg_agent
        -->|apply when images ready| kubepkg_crd
        -.->|notice changes| kubepkg_operator
        -->|apply| k8s_manifests
    
    kubepkg_agent
        --> |import image manifests / blobs| kubepkg_registry
        -.-> |pull image| k8s_manifests
        
    k8s_manifests
        -.->|notice changes| kubepkg_operator
        -->|update status| kubepkg_crd    
```

## Requires

* Docker Image only support v2
* k3s/k8s 1.22+

## `kubepkg.airgap.tgz`

* `kubepkg.json`: KubePkg CRD json
* [OCI Image Layout](https://github.com/opencontainers/image-spec/blob/main/image-layout.md)

```
kubepkg.json # must be first of all
blobs/ # blob contents
  <alg>/
    <hash>
index.json # oci image layout required
oci-layout # oci image layout required    
```

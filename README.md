# KubePkg

```mermaid

%%{init:{'theme':'base'}}%%
sequenceDiagram
    actor dev

    box centre
        participant kubepkg_dashboard as KubePkg Dashboard
    end

    box k3s/k8s cluster
        participant cluster_kubepkg_agent as KubePkg Agent
        participant cluster_k8s_api as Kubernetes API
        participant cluster_kubepkg_operator as KubePkg Operator
        participant cluster_container_registry as Container Registry
        participant cluster_pod as Workloads
    end

    par setup
        cluster_kubepkg_agent ->> kubepkg_dashboard: register
    end

    par version
        dev ->> kubepkg_dashboard: put KubePkg.yaml
    end

    par direct
        kubepkg_dashboard ->> cluster_kubepkg_agent: put KubePkg.yaml
        activate cluster_kubepkg_agent
        cluster_kubepkg_agent ->> cluster_k8s_api: apply KubePkg.yaml
        deactivate cluster_kubepkg_agent
    end

    par airgap
        kubepkg_dashboard ->> dev: get KubePkg.yaml
        activate dev
        dev ->> dev: create KubePkg.airgap.tgz

        dev ->> cluster_kubepkg_agent: update KubePkg.airgap.tgz

        deactivate dev

        activate cluster_kubepkg_agent
        cluster_kubepkg_agent ->> cluster_container_registry: upload images
        cluster_kubepkg_agent ->> cluster_k8s_api: apply KubePkg.yaml
        deactivate cluster_kubepkg_agent

    end

    par CRD to Kubernetes resources
        loop watch CRD kubepkg
            cluster_k8s_api -->> cluster_kubepkg_operator: convert to Kubernetes resources
            cluster_kubepkg_operator ->> cluster_k8s_api: apply kubepkg resources
        end

        par pod creation
            cluster_container_registry ->> cluster_pod: pull images

            loop watch kubepkg resources
                cluster_k8s_api -->> cluster_kubepkg_operator: convert to KubePkg.State
            end
        end
    end
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

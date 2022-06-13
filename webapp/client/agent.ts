import { createRequest } from "./client";

export interface KubeManifest {
  apiVersion: string,
  kind: string,
  metadata: {
    name: string
    namespace: string
  };
  spec: any
  status?: any
}

export interface KubePkg {
  apiVersion: "octohelm.tech/v1alpha1";
  kind: "KubePkg";
  metadata: {
    name: string
    namespace: string
  };
  spec: {
    version: string
    images: { [imagetag: string]: string | "" }
    manifests: {
      [key: string]: KubeManifest | { [key: string]: KubeManifest }
    }
  },
  status: {
    statuses: { [key: string]: any }
  }
}

export const listKubePkg = createRequest<void, KubePkg[]>(() => ({
  method: "GET",
  url: "/api/kubepkg.innoai.tech/v1/kubepkgs"
}));

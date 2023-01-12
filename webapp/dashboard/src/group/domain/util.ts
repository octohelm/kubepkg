import { get } from "@innoai-tech/lodash";
import type { ApisKubepkgV1Alpha1KubePkg } from "../../client/dashboard";

export const openAPISpecDoc = (spec: string) => {
  const p = new URLSearchParams();
  p.set("spec", spec);
  return `/openapi?${p.toString()}`;
};

export const openAPISpecPath = (kubepkg: ApisKubepkgV1Alpha1KubePkg) => {
  return get(
    kubepkg,
    ["spec", "deploy", "annotations", "octohelm.tech/openAPISpecPath"],
    ""
  );
};

export const deploymentID = (kubepkg: ApisKubepkgV1Alpha1KubePkg) => {
  return get(
    kubepkg,
    ["metadata", "annotations", "kubepkg.innoai.tech/deploymentID"],
    ""
  );
};

export const deploymentRevision = (kpkg: ApisKubepkgV1Alpha1KubePkg) => {
  return [`d${revision(kpkg)}`, `s${deploymentSettingID(kpkg)}`].join("+");
};

export const channel = (kubepkg: ApisKubepkgV1Alpha1KubePkg): string => {
  return get(
    kubepkg,
    ["metadata", "annotations", "kubepkg.innoai.tech/channel"],
    "DEV"
  );
};

export const revision = (kubepkg: ApisKubepkgV1Alpha1KubePkg): string => {
  return get(
    kubepkg,
    ["metadata", "annotations", "kubepkg.innoai.tech/revision"],
    ""
  );
};

export const kubepkgName = (kubepkg: ApisKubepkgV1Alpha1KubePkg): string => {
  return get(
    kubepkg,
    ["metadata", "annotations", "kubepkg.innoai.tech/name"],
    ""
  );
};

export const deploymentSettingID = (kubepkg: ApisKubepkgV1Alpha1KubePkg) => {
  return get(
    kubepkg,
    ["metadata", "annotations", "kubepkg.innoai.tech/deploymentSettingID"],
    ""
  );
};

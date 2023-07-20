import type { ApisKubepkgV1Alpha1KubePkg } from "@webapp/dashboard/client/dashboard";
import { component, t } from "@innoai-tech/vuekit";
import { styled, Box } from "@nodepkg/ui";
import { map } from "@nodepkg/runtime/lodash";

export const DeploymentResources = component(
  {
    kubepkg: t.custom<ApisKubepkgV1Alpha1KubePkg>()
  },
  (props) => {
    return () => {
      if (props.kubepkg.status?.resources) {
        return (
          <>
            {map(props.kubepkg.status?.resources, (r: any) => {
              return (
                <DeploymentResource>
                  <span>
                    {r.metadata.name}.
                    {displayGroupVersionKind(r.apiVersion, r.kind)}
                  </span>
                  {r["apiVersion"] == "apps/v1" && (
                    <PodStatuses podStatuses={r.status.podStatuses ?? []} />
                  )}
                </DeploymentResource>
              );
            })}
          </>
        );
      }

      return null;
    };
  }
);

const displayGroupVersionKind = (apiVersion: string, kind: string) => {
  if (apiVersion.includes("/")) {
    return `${kind}.${apiVersion}`;
  }
  return `${kind}.core/${apiVersion}`;
};

export const DeploymentResource = styled("div")({
  px: 24,
  py: 4,
  textStyle: "sys.label-small",
  display: "flex",
  flexDirection: "column",
  gap: 4
});

export enum PodPhase {
  Running = "Running",
  Pending = "Pending",
  Evicted = "Evicted",
  Failed = "Failed",
}

export interface ContainerStatus {
  image: string;
  imageID: string;
  containerID: string;
  ready: boolean;
  started: boolean;
  state: Record<string, any>;
}

export interface PodStatus {
  phase: PodPhase;
  containerStatuses: Array<ContainerStatus>;

  podIP?: string;
  hostIP?: string;
}

export const PodStatuses = styled(
  "table",
  { podStatuses: t.array(t.custom<PodStatus>()) },
  (props) => {
    return (Root) => {
      return (
        <Root>
          <thead>
          <tr>
            <th>PodIP</th>
            <th>Phase</th>
            <th>HostIP</th>
            <th style={{ width: "50%", maxWidth: "50%" }}>Containers</th>
          </tr>
          </thead>
          <tbody>
          {map(props.podStatuses, (podStatus) => {
            return (
              <Box
                component={"tr"}
                data-error={
                  podStatus.phase === PodPhase.Evicted ||
                  podStatus.phase === PodPhase.Failed
                }
                data-warning={podStatus.phase === PodPhase.Pending}
                sx={{
                  boxSize: "1.2em",
                  rounded: "xs",
                  _error: {
                    color: "sys.error"
                  },
                  _warning: {
                    color: "sys.secondary"
                  }
                }}
              >
                <td>{podStatus.podIP}</td>
                <td>{podStatus.phase}</td>
                <td>{podStatus.hostIP}</td>
                <td>
                  {map(podStatus?.containerStatuses, (containerStatus) => {
                    return (
                      <Box sx={{
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch"
                      }}>
                        <ContainerInfo containerStatus={containerStatus} />
                        {map(containerStatus.state, (v, k) => {
                          if (!v.reason) {
                            return "";
                          }
                          return (
                            <ReasonMessage
                              key={k}
                              reason={v.reason}
                              message={v.message}
                            />
                          );
                        })}
                      </Box>
                    );
                  })}
                </td>
              </Box>
            );
          })}
          </tbody>
        </Root>
      );
    };
  }
)({
  tableLayout: "fixed",
  textStyle: "sys.body-small",
  my: 4,
  borderSpacing: 4,
  width: "100%",
  "& > thead": {
    textAlign: "left"
  },
  "& td, & th": {
    p: 0
  }
});

export const ReasonMessage = component(
  {
    message: t.string(),
    reason: t.string()
  },
  ({ reason, message }) => {
    return () => (
      <Box component={"span"} sx={{ color: "sys.error" }}>
        [{reason}] {message}
      </Box>
    );
  }
);

export const ContainerInfo = component(
  {
    containerStatus: t.custom<ContainerStatus>()
  },
  (props) => {
    return () => {
      const [name, tagAndDigest] = props.containerStatus.image.split(":");
      const [tag, digestOrNone] = (tagAndDigest ?? "latest").split("@");
      const digest =
        digestOrNone ?? props.containerStatus.imageID.split("@")[1] ?? "";

      return (
        <Box
          component={"span"}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {name}:{tag}@{digest}
        </Box>
      );
    };
  }
);

export const isDeployFailed = (kubepkg: ApisKubepkgV1Alpha1KubePkg) => {
  if (kubepkg.status?.resources) {
    for (const r of kubepkg.status?.resources) {
      if (r["apiVersion"] == "apps/v1") {
        const status = r["status"];
        const podStatuses = status["podStatuses"] as Iterable<PodStatus>;

        for (const podStatus of podStatuses) {
          if (podStatus.phase == PodPhase.Failed) {
            return true;
          }

          if (podStatus.containerStatuses) {
            for (const containerStatus of podStatus.containerStatuses) {
              if (!(containerStatus.ready && containerStatus.started)) {
                return true;
              }
            }
          }
        }
      }
    }
  }
  return false;
};

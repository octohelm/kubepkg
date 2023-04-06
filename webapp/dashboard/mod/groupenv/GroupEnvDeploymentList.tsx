import {
  t,
  render,
  useRequest,
  component$,
  rx,
  observableRef,
  subscribeUntilUnmount,
  subscribeOnMountedUntilUnmount
} from "@nodepkg/runtime";
import { styled } from "@nodepkg/ui";
import {
  listGroupEnvDeployment,
  type ApisKubepkgV1Alpha1KubePkg,
  type GroupEnvWithCluster,
  listGroupEnvClusterDeployments,
  latestKubepkgs
} from "@webapp/dashboard/client/dashboard";
import { Container } from "@webapp/dashboard/layout";
import { map, groupBy, orderBy, partition } from "@nodepkg/runtime/lodash";
import { map as rxMap, tap } from "@nodepkg/runtime/rxjs";
import {
  channel,
  deploymentID,
  deploymentSettingID,
  kubepkgName,
  revision
} from "@webapp/dashboard/mod/groupenv/helpers";
import { GroupEnvCluster } from "./GroupEnvCluster";
import {
  DeploymentExpandable,
  DeploymentResources,
  DeploymentEndpoints,
  isDeployFailed
} from "./components";
import { alpha, variant } from "@innoai-tech/vueuikit";
import {
  GroupEnvDeploymentDeleteBtn,
  GroupEnvDeploymentHistoryPutBtn,
  GroupEnvDeploymentPutBtn,
  GroupEnvDeploymentsExportBtn
} from "@webapp/dashboard/mod/groupenv/actions";

export const GroupEnvDeploymentListItem = component$(
  {
    groupName: t.string(),
    envName: t.string(),
    kubepkg: t.custom<ApisKubepkgV1Alpha1KubePkg>()
  },
  (props, { render }) => {
    const kubepkg$ = observableRef<ApisKubepkgV1Alpha1KubePkg | null>(
      props.kubepkg
    );

    rx(
      props.kubepkg$,
      subscribeUntilUnmount((k) => kubepkg$.next(k))
    );

    return rx(
      kubepkg$,
      render((kubepkg) => {
        if (!kubepkg) {
          return null;
        }

        return (
          <DeploymentExpandable
            $heading={
              <GroupEnvDeploymentHeading error={isDeployFailed(kubepkg)}>
                <h3 data-heading-main="">
                  <span data-heading-title="">
                    {kubepkg.spec.deploy?.kind}
                    <i>/</i>
                    {kubepkg.metadata?.name}
                  </span>
                  <span data-heading-action="">
                    <GroupEnvDeploymentPutBtn
                      groupName={props.groupName}
                      envName={props.envName}
                      kubepkg={kubepkg}
                      onDidPut={(k) => {
                        kubepkg$.next(k);
                      }}
                    />
                    <GroupEnvDeploymentHistoryPutBtn
                      groupName={props.groupName}
                      envName={props.envName}
                      kubepkg={kubepkg}
                      onDidPut={(k) => {
                        kubepkg$.next(k);
                      }}
                    />
                    <GroupEnvDeploymentDeleteBtn
                      groupName={props.groupName}
                      envName={props.envName}
                      deploymentName={kubepkg.metadata?.name ?? ""}
                      onDidDelete={() => {
                        kubepkg$.next(null);
                      }}
                    />
                  </span>
                  <DeploymentEndpoints kubepkg={kubepkg} />
                </h3>
                <small data-heading-version="">
                  <ChannelAndUpgrade
                    upgradable={(kubepkg.status as any)?.upgradable}
                  >
                    {channel(kubepkg)}
                  </ChannelAndUpgrade>
                  <span>{kubepkg.spec.version}</span>
                  <small data-heading-revision="">
                    <span>{kubepkgName(kubepkg)}</span>
                    <span>d{deploymentID(kubepkg)}</span>
                    <span>r{revision(kubepkg)}</span>
                    <span>s{deploymentSettingID(kubepkg)}</span>
                  </small>
                </small>
              </GroupEnvDeploymentHeading>
            }
          >
            <DeploymentResources kubepkg={kubepkg} />
          </DeploymentExpandable>
        );
      })
    );
  }
);

export const ChannelAndUpgrade = styled("span", {
  upgradable: t.boolean().optional()
})({
  display: "flex",
  alignItems: "center",
  fontSize: "0.8em",
  height: 16,
  containerStyle: "sys.tertiary-container",
  rounded: "sm",
  py: 1,
  px: 8,
  _upgradable: {
    ":after": {
      content: `"有更新"`,
      ml: 4
    },
    containerStyle: "sys.error-container"
  }
});

export const GroupEnvDeploymentHeading = styled("div", {
  error: t.boolean()
})({
  display: "flex",
  flexDirection: "column",
  justifyContent: "stretch",
  width: "100%",
  gap: 4,

  px: 24,
  pt: 8,
  pb: 24,

  _error: {
    color: "sys.error",
    bgColor: variant("sys.error", alpha(0.08))
  },

  $data_heading_main: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    m: 0,

    $data_heading_action: {
      flex: 1,
      ml: 8,
      visibility: "hidden"
    },

    _hover: {
      $data_heading_action: {
        visibility: "visible"
      }
    }
  },

  $data_heading_title: {
    textStyle: "sys.title-small",
    display: "flex",
    alignItems: "center",
    gap: 4
  },

  $data_heading_version: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    textStyle: "sys.body-small",
    color: "sys.outline",

    $data_heading_revision: {
      visibility: "hidden"
    },
    _hover: {
      $data_heading_revision: {
        visibility: "visible"
      }
    }
  },

  $data_heading_revision: {
    ml: 4,
    textStyle: "sys.body-small",
    color: "sys.outline",
    display: "inline-flex",
    fontSize: 10,
    gap: 4
  }
});

export const GroupEnvDeploymentList = component$(
  {
    groupName: t.string(),
    env: t.custom<GroupEnvWithCluster>()
  },
  (props, {}) => {
    const kubepkgs$ = observableRef<Record<string, ApisKubepkgV1Alpha1KubePkg>>(
      {}
    );

    const list$ = useRequest(listGroupEnvDeployment);
    const listDeployed$ = useRequest(listGroupEnvClusterDeployments);
    const latest$ = useRequest(latestKubepkgs);

    const filters$ = observableRef({});

    rx(
      filters$,
      subscribeOnMountedUntilUnmount((_) => {
        list$.next({
          groupName: props.groupName,
          envName: props.env.envName,
          size: -1
        });
      })
    );

    rx(
      list$,
      tap((resp) => {
        const identities: string[] = [];
        for (const item of resp.body.items) {
          identities.push(`${kubepkgName(item)}@${channel(item)}`);
        }
        latest$.next({
          names: identities
        });
      }),
      tap(() => {
        if (props.env.cluster && !!props.env.cluster.endpoint) {
          listDeployed$.next({
            groupName: props.groupName,
            envName: props.env.envName
          });
        }
      }),
      subscribeUntilUnmount((resp) => {
        kubepkgs$.next((kubepkgs) => {
          for (const item of resp.body.items) {
            kubepkgs[deploymentID(item)] = item;
          }
        });
      })
    );

    rx(
      latest$,
      subscribeUntilUnmount((resp) => {
        const versionInfos = resp.body;

        kubepkgs$.next((kubepkgs) => {
          for (const k in kubepkgs) {
            const kubepkg = kubepkgs[k]!;

            const id = `${kubepkgName(kubepkg)}@${channel(kubepkg)}`;

            if (versionInfos[id]) {
              if (versionInfos[id]!.revisionID != revision(kubepkg)) {
                Object.assign((kubepkg.status ??= {}), {
                  upgradable: true
                });
              }
            }
          }
        });
      })
    );

    rx(
      listDeployed$,
      subscribeUntilUnmount((resp) => {
        kubepkgs$.next((kubepkgs) => {
          for (const item of resp.body) {
            if (kubepkgs[deploymentID(item)]) {
              kubepkgs[deploymentID(item)]!.status = item.status;
            }
          }
        });
      })
    );

    const listEl = rx(
      kubepkgs$,
      rxMap((list) =>
        groupBy(list, (k) => {
          return k.spec.deploy?.kind;
        })
      ),
      render((grouped) => {
        const [configs, workloads] = partition(
          orderBy(Object.keys(grouped)),
          (k) => k === "ConfigMap" || k == "Secret"
        );

        return (
          <>
            {map([...workloads, ...configs], (k) => {
              return (
                <GroupedListView key={k}>
                  {map(
                    orderBy(grouped[k], (k) => k.metadata?.name),
                    (k) => (
                      <GroupEnvDeploymentListItem
                        groupName={props.groupName}
                        envName={props.env.envName}
                        kubepkg={k}
                      />
                    )
                  )}
                </GroupedListView>
              );
            })}
          </>
        );
      })
    );

    return () => (
      <Container
        $toolbar={<GroupEnvCluster envName={props.env.envName} />}
        $action={
          <>
            <GroupEnvDeploymentsExportBtn
              groupName={props.groupName}
              envName={props.env.envName}
            />
            <GroupEnvDeploymentPutBtn
              groupName={props.groupName}
              envName={props.env.envName}
            />
          </>
        }
      >
        {listEl}
      </Container>
    );
  }
);

const GroupedListView = styled("div")({
  py: 16
});

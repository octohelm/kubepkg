import {
  t,
  rx,
  component$,
  observableRefWithSyncURL,
  useRequest,
  subscribeOnMountedUntilUnmount,
  subscribeUntilUnmount,
  render,
  observableRef
} from "@nodepkg/runtime";
import {
  type GroupEnvWithCluster,
  KubepkgChannel,
  getKubepkgRevision,
  type ApisKubepkgV1Alpha1KubePkg
} from "@webapp/dashboard/client/dashboard";
import { Container } from "@webapp/dashboard/layout";
import {
  GroupKubepkgChannelSwitch,
  GroupKubepkgAutocomplete,
  GroupKubepkgVersionSelect
} from "@webapp/dashboard/mod/groupkubepkg";
import { Box } from "@nodepkg/ui";
import { KubePkgEditor } from "@webapp/dashboard/mod/kubepkg";

export const GroupEnvDeploymentCreate = component$(
  {
    groupName: t.string(),
    env: t.custom<GroupEnvWithCluster>(),
    syncToURL: t.boolean().optional()
  },
  (props, {}) => {
    const defaultFilters = {
      groupName: "",
      kubepkgName: "",
      channel: KubepkgChannel.DEV,
      revisionID: ""
    };

    const filters$ = observableRefWithSyncURL(defaultFilters, props.syncToURL);
    const kubepkgRevision$ = useRequest(getKubepkgRevision);

    rx(
      filters$,
      subscribeOnMountedUntilUnmount((filters) => {
        if (filters.groupName && filters.revisionID) {
          kubepkgRevision$.next({
            groupName: filters.groupName,
            name: filters.kubepkgName,
            channel: filters.channel,
            revisionID: filters.revisionID
          });
        }
      })
    );

    const kubepkg$ = observableRef<ApisKubepkgV1Alpha1KubePkg>({
      kind: "KubePkg",
      apiVersion: "octohelm.tech/v1alpha1",
      metadata: {},
      spec: {
        version: ""
      }
    });

    rx(
      kubepkgRevision$,
      subscribeUntilUnmount((resp) => {
        kubepkg$.value = resp.body;
      })
    );


    const kubepkgEditorEl = rx(
      kubepkg$,
      render((kubepkg) => {
        return (
          <KubePkgEditor key={filters$.value.revisionID} kubepkg={kubepkg} onSubmit={console.log} />
        );
      })
    );

    return () => (
      <Container
        $toolbar={
          <GroupKubepkgAutocomplete
            groupKubepkgName={[
              ...(filters$.value.groupName ? [filters$.value.groupName] : []),
              ...(filters$.value.kubepkgName
                ? [filters$.value.kubepkgName]
                : [])
            ].join("/")}
            onSelected={(groupKubepkgName) =>
              filters$.next((filters) => {
                const [groupName, kubepkgName] = groupKubepkgName.split("/");
                filters.groupName = groupName!;
                filters.kubepkgName = kubepkgName!;
              })
            }
          />
        }
        $action={
          <Box
            sx={{
              width: "24vw",
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <GroupKubepkgChannelSwitch
              value={filters$.value.channel}
              onValueChange={(c) => {
                filters$.next((filters) => {
                  filters.channel = c;
                });
              }}
            />
          </Box>
        }
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            height: "100%",
            gap: 16
          }}
        >
          <Box sx={{ flex: 1 }}>{kubepkgEditorEl}</Box>
          {filters$.value.groupName && filters$.value.kubepkgName && (
            <Box sx={{ width: "24vw", overflow: "auto" }}>
              <GroupKubepkgVersionSelect
                groupName={filters$.value.groupName}
                kubepkgName={filters$.value.kubepkgName}
                channel={filters$.value.channel}
                revisionID={filters$.value.revisionID}
                onSelected={(version) => {
                  filters$.next((filters) => {
                    filters.revisionID = version;
                  });
                }}
              />
            </Box>
          )}
        </Box>
      </Container>
    );
  }
);

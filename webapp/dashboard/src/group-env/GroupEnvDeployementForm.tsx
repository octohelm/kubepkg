import type { ApisKubepkgV1Alpha1KubePkg } from "../client/dashboard";
import {
  channel,
  GroupEnvDeploymentsProvider, GroupProvider,
  kubepkgName,
  revision
} from "../group";
import {
  StateSubject,
  Subscribe,
  useStateSubject
} from "@innoai-tech/reactutil";
import { useDialog, useEpics, useProxy } from "../layout";
import { ignoreElements, map as rxMap, tap, filter as rxFilter } from "rxjs";
import { KubePkgEditor, useKubePkgAutocomplete } from "../kubepkg";
import type { KubepkgNameInfo } from "../kubepkg/domain";
import { Box, Divider, Stack } from "@mui/material";
import { GroupKubePkgVersionProvider } from "../kubepkg/domain";
import { GroupKubepkgVersionList } from "../kubepkg/KubePkgVersion";
import { KubepkgChannel } from "../client/dashboard";
import { omit } from "@innoai-tech/lodash";

const KubepkgVersionUpgrade = ({
                                 revision$,
                                 kubepkg$,
                                 channel$
                               }: {
  revision$: StateSubject<string>;
  channel$: StateSubject<KubepkgChannel>;
  kubepkg$: StateSubject<ApisKubepkgV1Alpha1KubePkg>;
}) => {
  const kubepkgVersion$ = GroupKubePkgVersionProvider.use$();

  useEpics(kubepkg$, (kubepkg$) =>
    kubepkgVersion$.get$.pipe(
      rxMap((resp) => {
        return {
          ...resp.body,
          metadata: {
            ...kubepkg$.value.metadata,
            annotations: {
              ...(kubepkg$.value.metadata?.annotations || {}),
              ...(resp.body.metadata?.annotations || {})
            }
          },
          spec: {
            version: resp.body.spec.version,
            deploy: resp.body.spec.deploy,
            config: kubepkg$.value.spec?.config || {},
            ...omit(resp.body.spec, ["version", "deploy", "config"])
          }
        };
      })
    )
  );

  useEpics(kubepkg$, (_) =>
    revision$.pipe(
      tap((revision) => {
        if (revision) {
          kubepkgVersion$.get$.next({
            groupName: kubepkgVersion$.groupName,
            name: kubepkgVersion$.kubePkgName,
            channel: channel$.value,
            revisionID: revision
          });
        }
      }),
      ignoreElements()
    )
  );

  return null;
};

export const KubePkgEditorWithVersionList = ({
                                               kubepkg$
                                             }: {
  kubepkg$: StateSubject<ApisKubepkgV1Alpha1KubePkg>;
}) => {
  const group$ = GroupProvider.use$();

  const kubepkgNameInfo$ = useStateSubject({} as KubepkgNameInfo);
  const channel$ = useStateSubject(KubepkgChannel.DEV);
  const revision$ = useStateSubject("");

  const kubePkgAutocomplete$ = useKubePkgAutocomplete({
    groupName: group$.value.name
  });

  useEpics(kubepkgNameInfo$,
    (_) => kubePkgAutocomplete$
      .pipe(
        rxFilter(({ groupName }) => !!groupName),
        tap(() => {
          kubePkgAutocomplete$.popper$.next(false);
        })
      ),
    () =>
      kubepkg$.pipe(
        rxMap((kubepkg) => {
          const [groupName, kubePkgName] = kubepkgName(kubepkg).split("/");
          return {
            groupName: groupName || "",
            kubePkgName: kubePkgName || ""
          };
        })
      )
  );

  useEpics(channel$, () => kubepkg$.pipe(rxMap((kubepkg) => channel(kubepkg))));
  useEpics(revision$, () =>
    kubepkg$.pipe(rxMap((kubepkg) => revision(kubepkg)))
  );

  return (
    <Stack direction="row" spacing={3}>
      <KubePkgEditor kubepkg$={kubepkg$} />
      <Stack spacing={1} sx={{ width: "36%", height: "70vh", overflow: "hidden" }}>
        <Box>
          {kubePkgAutocomplete$.render()}
        </Box>
        <Divider />
        <Subscribe value$={kubepkgNameInfo$}>
          {(info) =>
            info.groupName ? (
              <GroupKubePkgVersionProvider
                key={`groups/${info.groupName}/names/${info.kubePkgName}`}
                groupName={info.groupName}
                kubePkgName={info.kubePkgName}
              >
                <KubepkgVersionUpgrade
                  kubepkg$={kubepkg$}
                  channel$={channel$}
                  revision$={revision$}
                />
                <GroupKubepkgVersionList
                  channel$={channel$}
                  selectedRevision$={revision$}
                />
              </GroupKubePkgVersionProvider>
            ) : null
          }
        </Subscribe>
      </Stack>
    </Stack>
  );
};

export const useGroupEnvDeploymentFormWithDialog = (
  kubepkg?: ApisKubepkgV1Alpha1KubePkg
) => {
  const kubepkg$ = useStateSubject(kubepkg || {} as ApisKubepkgV1Alpha1KubePkg);

  const groupEnvDeployments$ = GroupEnvDeploymentsProvider.use$();

  const action = kubepkg ? "更新" : "新建";

  const dialog$ = useDialog(
    {
      title: `${action} KubePkg`,
      action: `${action} KubePkg`,
      sx: { "& .MuiDialog-paper": { maxWidth: "96vw", width: "96vw" } },
      content: <KubePkgEditorWithVersionList kubepkg$={kubepkg$} />,
      onConfirm: () => {
        if (kubepkg$.value) {
          groupEnvDeployments$.put$.next({
            groupName: groupEnvDeployments$.groupName,
            envName: groupEnvDeployments$.envName,
            body: kubepkg$.value
          });
        }
      }
    },
    () => groupEnvDeployments$.put$.pipe(rxMap(() => false))
  );

  return useProxy(groupEnvDeployments$, {
    operationID: groupEnvDeployments$.put$.operationID,
    dialog$: dialog$
  });
};

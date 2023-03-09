import type { ApisKubepkgV1Alpha1KubePkg } from "../client/dashboard";
import {
  channel,
  GroupEnvDeploymentsProvider,
  GroupProvider,
  kubepkgName,
  revision
} from "../group";
import {
  StateSubject,
  Subscribe,
  useExt,
  useMemoObservable,
  useObservableEffect,
  useStateSubject
} from "@nodepkg/runtime";
import { DialogProps, useDialog } from "../layout";
import { map as rxMap, tap, filter as rxFilter, merge, distinctUntilChanged } from "rxjs";
import { KubePkgEditor, useKubePkgAutocomplete } from "../kubepkg";
import type { KubepkgNameInfo } from "../kubepkg/domain";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack
} from "@mui/material";
import { GroupKubePkgVersionProvider } from "../kubepkg/domain";
import { GroupKubepkgVersionList } from "../kubepkg/KubePkgVersion";
import { KubepkgChannel } from "../client/dashboard";
import { last, omit } from "@innoai-tech/lodash";
import { Close } from "@mui/icons-material";

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

  useObservableEffect(() =>
    merge(
      revision$.pipe(
        rxFilter((revision) => !!revision),
        tap((revision) => {
          kubepkgVersion$.get$.next({
            groupName: kubepkgVersion$.groupName,
            name: kubepkgVersion$.kubePkgName,
            channel: channel$.value,
            revisionID: revision
          });
        })
      ),
      kubepkgVersion$.get$.pipe(
        tap((resp) => {
          kubepkg$.next({
            ...resp.body,
            metadata: {
              ...kubepkg$.value.metadata,
              name:
                kubepkg$.value.metadata?.name ||
                last(kubepkgName(resp.body).split("/")) ||
                "",
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
          });
        })
      )
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

  useObservableEffect(() => merge(
    kubePkgAutocomplete$.pipe(
      rxFilter(({ groupName }) => !!groupName),
      tap(() => {
        kubePkgAutocomplete$.popper$.next(false);
      })
    ),
    kubepkg$.pipe(
      rxMap((kubepkg) => {
        const [groupName, kubePkgName] = kubepkgName(kubepkg).split("/");
        return {
          groupName: groupName || "",
          kubePkgName: kubePkgName || ""
        };
      })
    )
  ).pipe(
    tap((kubepkgNameInfo) => kubepkgNameInfo$.next(kubepkgNameInfo))
  ));

  useObservableEffect(() => merge(
    kubepkg$
      .pipe(
        rxMap((kubepkg) => channel(kubepkg) as KubepkgChannel),
        distinctUntilChanged(),
        tap((channel) => channel$.next(channel))
      ),
    kubepkg$
      .pipe(
        rxMap((kubepkg) => revision(kubepkg)),
        distinctUntilChanged(),
        tap((channel) => revision$.next(channel))
      )
  ));

  return (
    <>
      <Box>{kubePkgAutocomplete$.render()}</Box>
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
    </>
  );
};

export const useDialogWithoutConfirmButtons = ({
                                                 title,
                                                 content,
                                                 sx = { "& .MuiDialog-paper": { width: "80%" } }
                                               }: DialogProps) => {
  const dialog$ = useStateSubject(false);

  const dialogElement$ = useMemoObservable(() => dialog$.pipe(
    rxMap((open) => (
      <Dialog sx={sx} open={open} onClose={() => dialog$.next((v) => !v)}>
        <DialogTitle>
          {title}
          <IconButton
            aria-label="close"
            onClick={() => dialog$.next((v) => !v)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
      </Dialog>
    ))
  ));

  return useExt(dialog$, {
    title: title,
    elements$: dialogElement$
  });
};

export const useGroupEnvDeploymentPutWithDialog = (
  kubepkg?: ApisKubepkgV1Alpha1KubePkg,
  { content, title } = {
    content: (kubepkg$: StateSubject<ApisKubepkgV1Alpha1KubePkg>) => (
      <KubePkgEditorWithVersionList kubepkg$={kubepkg$} />
    ),
    title: (action: string) => `${action} KubePkg`
  }
) => {
  const kubepkg$ = useStateSubject(
    kubepkg || ({} as ApisKubepkgV1Alpha1KubePkg)
  );

  const groupEnvDeployments$ = GroupEnvDeploymentsProvider.use$();

  const action = kubepkg ? "更新" : "新建";

  const dialog$ = useDialogWithoutConfirmButtons({
    title: title(action),
    action: `${action}`,
    sx: {
      "& .MuiDialog-paper": {
        maxWidth: "98vw",
        width: "98vw",
        overflow: "hidden"
      }
    },
    content: (
      <Stack direction="row" spacing={2} sx={{ height: "80vh" }}>
        <Box sx={{ width: "64vw", overflow: "auto" }}>
          <KubePkgEditor
            overwrites={!!kubepkg}
            kubepkg$={kubepkg$}
            onSubmit={(kubepkg) => {
              groupEnvDeployments$.put$.next({
                groupName: groupEnvDeployments$.groupName,
                envName: groupEnvDeployments$.envName,
                body: kubepkg
              });
            }}
          />
        </Box>
        <Stack spacing={1} sx={{ flex: 1, overflow: "auto" }}>
          {content(kubepkg$)}
        </Stack>
      </Stack>
    )
  });

  useObservableEffect(() =>
    groupEnvDeployments$.put$.pipe(tap(() => dialog$.next(false)))
  );

  return useExt(groupEnvDeployments$.put$, {
    dialog$: dialog$
  });
};


export const useGroupEnvDeploymentDelWithDialog = (kubepkg: ApisKubepkgV1Alpha1KubePkg) => {
  const groupEnvDeployments$ = GroupEnvDeploymentsProvider.use$();

  const dialog$ = useDialog({
    title: `确认删除部署 ${kubepkg.metadata?.name}`,
    content: (
      <Box>
        一旦删除所有历史记录将清空
      </Box>
    ),
    onConfirm: () => {
      if (kubepkg.metadata?.name) {
        groupEnvDeployments$.del$.next({
          groupName: groupEnvDeployments$.groupName,
          envName: groupEnvDeployments$.envName,
          deploymentName: kubepkg.metadata.name
        });
      }
    }
  });

  useObservableEffect(() => groupEnvDeployments$.del$.pipe(tap(() => dialog$.next(false))));

  return useExt(groupEnvDeployments$.del$, {
    dialog$: dialog$
  });
};

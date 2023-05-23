import {
  t,
  rx,
  component$,
  ext,
  useRequest,
  subscribeUntilUnmount,
  render,
  observableRef,
  EventKit,
  onMounted
} from "@nodepkg/runtime";
import {
  type ApisKubepkgV1Alpha1KubePkg,
  putGroupEnvDeployment,
  listGroupEnvDeploymentHistory
} from "@webapp/dashboard/client/dashboard";
import {
  Box,
  Tooltip,
  IconButton,
  Icon,
  mdiClose,
  useDialog,
  styled,
  DialogHeadline,
  variant,
  alpha,
  mdiHistory
} from "@nodepkg/ui";
import { KubePkgEditor, mergeOverwritesIfExists } from "@webapp/dashboard/mod/kubepkg";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import { pick, omit, get } from "@nodepkg/runtime/lodash";
import { parseISO, format } from "@nodepkg/runtime/date-fns";
import { combineLatest } from "@nodepkg/runtime/rxjs";
import {
  deploymentID,
  deploymentSettingID,
  deploymentRevision
} from "@webapp/dashboard/mod/groupenv/helpers";

export const DeploymentHistoryListItem = styled(
  "div",
  {
    active: t.boolean().optional(),
    kubepkg: t.custom<ApisKubepkgV1Alpha1KubePkg>()
  },
  (props) => (Wrap) => {
    return (
      <Wrap data-active={props.active}>
        <div data-history-created="">
          {get(props.kubepkg.metadata, "creationTimestamp") &&
            format(
              parseISO(get(props.kubepkg.metadata, "creationTimestamp")!),
              "yyyy-MM-dd HH:mm"
            )}
        </div>
        <div data-history-setting="">s{deploymentSettingID(props.kubepkg)}</div>
        <div data-history-version="">{props.kubepkg.spec.version}</div>
      </Wrap>
    );
  }
)({
  px: 16,
  py: 8,
  textStyle: "sys.label-small",
  font: "code",

  _active: {
    containerStyle: "sys.primary-container"
  },

  $data_history_created: {
    color: "sys.primary"
  },

  $data_history_version: {
    fontSize: "0.8em",
    opacity: 0.8
  },

  $data_history_setting: {
    fontSize: "0.8em",
    opacity: 0.8
  }
});

const GroupEnvDeploymentHistoryPut = component$(
  {
    groupName: t.string(),
    envName: t.string(),
    kubepkg: t.custom<ApisKubepkgV1Alpha1KubePkg>(),
    onSubmit: t.custom<(kubepkg: ApisKubepkgV1Alpha1KubePkg) => void>()
  },
  (props, { emit }) => {
    const kubepkg$ = observableRef<ApisKubepkgV1Alpha1KubePkg>(props.kubepkg);

    rx(
      kubepkg$,
      subscribeUntilUnmount((k) => (kubepkg$.value = k))
    );

    const kubepkgHistory$ = useRequest(listGroupEnvDeploymentHistory);

    onMounted(() => {
      kubepkgHistory$.next({
        groupName: props.groupName,
        envName: props.envName,
        deploymentID: deploymentID(props.kubepkg),
        size: -1
      });
    });

    const kubepkgHistoryEl = rx(
      combineLatest([kubepkgHistory$, kubepkg$]),
      render(([resp, kubepkg]) => {
        return (
          <Box sx={{ py: 8 }}>
            {resp.body?.map((k) => (
              <DeploymentHistoryListItem
                active={deploymentRevision(k) == deploymentRevision(kubepkg)}
                kubepkg={k}
                onClick={() => {
                  kubepkg$.value = k;
                }}
              />
            ))}
          </Box>
        );
      })
    );

    const kubepkgEditorEl = rx(
      kubepkg$,
      render((kubepkg) => {
        const t = pick(kubepkg, ["kind", "apiVersion", "metadata", "spec"]);
        const overwrites = get(t, ["metadata", "annotations", "kubepkg.innoai.tech/overwrites"]);

        return (
          <KubePkgEditor
            key={deploymentRevision(kubepkg)}
            kubepkg={{
              ...t,
              metadata: {
                ...t.metadata,
                annotations: omit(t.metadata?.annotations ?? {}, "kubepkg.innoai.tech/overwrites")
              }
            }}
            overwrites={overwrites ? JSON.parse(overwrites) : {}}
            onSubmit={(k) => emit("submit", k)}
          />
        );
      })
    );

    return () => (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          height: "100%",
          gap: 8
        }}
      >
        <Box sx={{ flex: 1, overflow: "hidden" }}>{kubepkgEditorEl}</Box>
        <Box sx={{}}>{kubepkgHistoryEl}</Box>
      </Box>
    );
  }
);

export const useGroupEnvDeploymentHistoryPut = (
  resolve: () => {
    groupName: string;
    envName: string;
    kubepkg: ApisKubepkgV1Alpha1KubePkg;
  }
) => {
  const put$ = useRequest(putGroupEnvDeployment);

  const action = "部署历史";

  const dialog$ = useDialog(() => (
    <DialogContainer>
      <DialogHeadline
        sx={{
          display: "flex",
          alignItems: "center",
          px: 16,
          py: 8,
          borderBottom: "1px solid",
          borderColor: variant("sys.outline-variant", alpha(0.38))
        }}
      >
        <Box sx={{ flex: 1, px: 8 }}>{action}</Box>
        <IconButton onClick={() => (dialog$.value = false)}>
          <Icon path={mdiClose} />
        </IconButton>
      </DialogHeadline>
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <GroupEnvDeploymentHistoryPut
          {...resolve()}
          onSubmit={(kubepkg) => {
            const ctx = resolve();

            put$.next({
              groupName: ctx.groupName,
              envName: ctx.envName,
              body: kubepkg
            });
          }}
        />
      </Box>
    </DialogContainer>
  ));

  rx(
    put$,
    subscribeUntilUnmount(() => {
      dialog$.value = false;
    })
  );

  return ext(put$, {
    dialog$,
    action
  });
};

const DialogContainer = styled("div")({
  width: "96vw",
  height: "96vh",
  rounded: "sm",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  containerStyle: "sys.surface"
});

export const GroupEnvDeploymentHistoryPutBtn = component$(
  {
    groupName: t.string(),
    envName: t.string(),
    kubepkg: t.custom<ApisKubepkgV1Alpha1KubePkg>(),
    onDidPut: t.custom<(kubepkg: ApisKubepkgV1Alpha1KubePkg) => void>()
  },
  (props, { emit }) => {
    const put$ = useGroupEnvDeploymentHistoryPut(() => ({
      groupName: props.groupName,
      envName: props.envName,
      kubepkg: props.kubepkg
    }));

    rx(
      put$,
      subscribeUntilUnmount((resp) => {
        emit("did-put", mergeOverwritesIfExists(resp.body));
      })
    );

    const iconButtonClick$ = EventKit.create<MouseEvent>();

    rx(
      iconButtonClick$,
      EventKit.stopPropagation(),
      subscribeUntilUnmount(() => {
        put$.dialog$.value = true;
      })
    );

    return () => {
      return (
        <AccessControl op={put$}>
          <Tooltip title={put$.action}>
            <IconButton onClick={iconButtonClick$}>
              <Icon path={mdiHistory} />
            </IconButton>
          </Tooltip>
          {put$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);

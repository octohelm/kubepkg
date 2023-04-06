import {
  t,
  rx,
  component$,
  ext,
  useRequest,
  subscribeOnMountedUntilUnmount,
  subscribeUntilUnmount,
  render,
  observableRef,
  EventKit
} from "@nodepkg/runtime";
import {
  KubepkgChannel,
  getKubepkgRevision,
  type ApisKubepkgV1Alpha1KubePkg,
  putGroupEnvDeployment
} from "@webapp/dashboard/client/dashboard";
import { Container } from "@webapp/dashboard/layout";
import {
  GroupKubepkgChannelSwitch,
  GroupKubepkgAutocomplete,
  GroupKubepkgVersionSelect
} from "@webapp/dashboard/mod/groupkubepkg";
import {
  Box,
  Tooltip,
  IconButton,
  Icon,
  mdiClose,
  mdiPlusThick,
  mdiTextBoxEdit,
  useDialog,
  styled,
  DialogHeadline,
  variant,
  alpha
} from "@nodepkg/ui";
import {
  KubePkgEditor,
  resolveKubePkgVersionAndSetting
} from "@webapp/dashboard/mod/kubepkg";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import { combineLatest } from "@nodepkg/runtime/rxjs";
import { revision } from "@webapp/dashboard/mod/groupenv/helpers";
import { omit } from "@nodepkg/runtime/lodash";

const GroupEnvDeploymentPut = component$(
  {
    kubepkg: t.custom<ApisKubepkgV1Alpha1KubePkg>().optional(),
    onSubmit: t.custom<(kubepkg: ApisKubepkgV1Alpha1KubePkg) => void>()
  },
  (props, { emit }) => {
    const filters$ = observableRef({
      groupName: "",
      kubepkgName: "",
      channel: KubepkgChannel.DEV,
      revisionID: ""
    });

    if (props.kubepkg) {
      rx(
        props.kubepkg$,
        subscribeUntilUnmount((kubepkg) => {
          const founded = resolveKubePkgVersionAndSetting(kubepkg);

          filters$.next({
            groupName: founded.groupName,
            kubepkgName: founded.kubepkgName,
            channel: founded.kubepkgChannel,
            revisionID: founded.revisionID
          });
        })
      );
    }

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

    const kubepkgTemplate$ = observableRef<ApisKubepkgV1Alpha1KubePkg>({
      kind: "KubePkg",
      apiVersion: "octohelm.tech/v1alpha1",
      metadata: {},
      spec: {
        version: ""
      }
    });

    const kubepkgTemplateFailed$ = observableRef<string>("");

    const kubepkgTemplateFailedEl = rx(
      kubepkgTemplateFailed$,
      render((msg) => {
        return (
          msg && (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "sys.error"
              }}
            >
              {msg}
            </Box>
          )
        );
      })
    );

    rx(
      kubepkgRevision$,
      subscribeUntilUnmount((resp) => {
        kubepkgTemplateFailed$.value = "";
        kubepkgTemplate$.value = resp.body;
      })
    );

    rx(
      kubepkgRevision$.error$,
      subscribeUntilUnmount((resp) => {
        kubepkgTemplateFailed$.value = `模板获取异常: ${resp.body.msg}`;
      })
    );

    const kubepkgEditorEl = rx(
      combineLatest([kubepkgTemplate$, props.kubepkg$]),
      render(([kubepkgTemplate, overwrites]) => {
        const revisionID = revision(kubepkgTemplate);

        if (overwrites) {
          return (
            revisionID &&
            kubepkgTemplate.spec.version && (
              <KubePkgEditor
                key={revisionID}
                kubepkg={kubepkgTemplate}
                overwrites={{
                  metadata: {
                    name: overwrites.metadata?.name
                  },
                  spec: omit(overwrites.spec, ["version"]) as any
                }}
                onSubmit={(k) => emit("submit", k)}
              />
            )
          );
        }

        return (
          <KubePkgEditor
            key={revisionID}
            kubepkg={kubepkgTemplate}
            onSubmit={(k) => emit("submit", k)}
          />
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
              width: "22vw",
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
            gap: 8
          }}
        >
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            {kubepkgEditorEl}
            {kubepkgTemplateFailedEl}
          </Box>
          {filters$.value.groupName && filters$.value.kubepkgName && (
            <Box sx={{ px: 8, width: "22vw", overflow: "auto" }}>
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

export const useGroupEnvDeploymentPut = (
  resolve: () => {
    groupName: string;
    envName: string;
    kubepkg?: ApisKubepkgV1Alpha1KubePkg;
  }
) => {
  const put$ = useRequest(putGroupEnvDeployment);

  const action = resolve().kubepkg ? "编辑部署" : "创建部署";

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
        <GroupEnvDeploymentPut
          kubepkg={resolve().kubepkg}
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

export const GroupEnvDeploymentPutBtn = component$(
  {
    groupName: t.string(),
    envName: t.string(),
    kubepkg: t.custom<ApisKubepkgV1Alpha1KubePkg>().optional(),
    onDidPut: t.custom<(kubepkg: ApisKubepkgV1Alpha1KubePkg) => void>()
  },
  (props, { emit }) => {
    const put$ = useGroupEnvDeploymentPut(() => props);

    rx(
      put$,
      subscribeUntilUnmount((resp) => {
        emit("did-put", resp.body);
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
              <Icon path={props.kubepkg ? mdiTextBoxEdit : mdiPlusThick} />
            </IconButton>
          </Tooltip>
          {put$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);

import {
  useRequest,
  component$,
  rx,
  t,
  ext,
  render,
  subscribeUntilUnmount
} from "@nodepkg/runtime";
import {
  type Cluster,
  createClusterAgentResources
} from "@webapp/dashboard/client/dashboard";
import {
  Box,
  useNotify,
  mdiContentCopy
} from "@nodepkg/ui";
import {
  dump
} from "js-yaml";

import {
  useDialog,
  Tooltip,
  DialogContainer,
  DialogHeadline,
  DialogContent,
  IconButton,
  Icon,
  TextButton,
  FilledButton,
  mdiKubernetes
} from "@nodepkg/ui";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import copy from "copy-to-clipboard";

const useClusterCreateAgentResources = (
  cluster: { name: string }
) => {
  const create$ = useRequest(createClusterAgentResources);

  const action = "部署 Agent";

  const notify = useNotify();

  const contentEl = rx(
    create$,
    render((resp) => {
      const data = `kubectl apply -f - <<EOF
${resp.body.map((v) => dump(v)).join(`---
`)}
EOF`;

      return (
        <Box
          sx={{
            position: "relative",
            p: 16,
            rounded: "sm",
            bgColor: "sys.surface-container-low",
            maxHeight: "60vh",
            maxWidth: "80vw",
            overflow: "auto",
            fontSize: "0.8em",
            cursor: "pointer"
          }}
        >
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
            <Tooltip title={"复制到剪贴板, 并在 k8s 集群执行"}>
              <IconButton onClick={() => {
                copy(data, {});
                notify("已复制到剪贴板");
              }}>
                <Icon path={mdiContentCopy} />
              </IconButton>
            </Tooltip>
          </Box>
          <pre>
            <code>
              {data}
            </code>
          </pre>
        </Box>
      );
    })
  );

  const dialog$ = useDialog(() => {
    return (
      <DialogContainer>
        <DialogHeadline>{action}</DialogHeadline>
        <DialogContent
          $action={
            <>
              <FilledButton type="submit">确定</FilledButton>
              <TextButton
                onClick={() => {
                  dialog$.value = false;
                }}
              >
                取消
              </TextButton>
            </>
          }
        >
          {contentEl}
        </DialogContent>
      </DialogContainer>
    );
  });


  rx(
    create$.error$,
    subscribeUntilUnmount((resp) => {
      notify(resp.error.msg, {});
    })
  );

  rx(
    dialog$,
    subscribeUntilUnmount((dialog) => {
      if (dialog) {
        create$.next({ name: cluster.name });
      }
    })
  );

  return ext(create$, {
    action,
    dialog$
  });
};

export const ClusterCreateAgentResourcesBtn = component$(
  {
    cluster: t.custom<Cluster>()
  },
  (props, {}) => {
    const createAgentResources$ = useClusterCreateAgentResources(props.cluster);

    return () => {
      return (
        <AccessControl op={createAgentResources$}>
          <Tooltip title={createAgentResources$.action}>
            <IconButton onClick={() => (createAgentResources$.dialog$.value = true)}>
              <Icon path={mdiKubernetes} />
            </IconButton>
          </Tooltip>
          {createAgentResources$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);

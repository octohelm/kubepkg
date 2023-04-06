import {
  useRequest,
  component$,
  rx,
  t,
  ext,
  FormData,
  subscribeUntilUnmount
} from "@nodepkg/runtime";
import {
  type Cluster,
  renameCluster
} from "@webapp/dashboard/client/dashboard";
import {
  useDialog,
  Tooltip,
  DialogContainer,
  DialogHeadline,
  DialogContent,
  FormControl,
  IconButton,
  Icon,
  TextButton,
  FilledButton,
  mdiRenameBoxOutline
} from "@nodepkg/ui";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import { REGEX_ID } from "./ClusterPut";

const schema = t.object({
  name: t
    .string()
    .use(
      t.pattern(...REGEX_ID),
      FormData.label("集群名称")
    )
});

const useClusterRename = (
  cluster: { name: string }
) => {
  const rename$ = useRequest(renameCluster);
  const form$ = FormData.of(schema, cluster);

  rx(
    form$,
    subscribeUntilUnmount(({ name }) => {
      rename$.next({
        name: cluster.name,
        newName: name
      });
    })
  );

  rx(
    rename$.error$,
    subscribeUntilUnmount((resp) => {
      form$.setErrors(FormData.errorFromRespError(resp.error));
    })
  );

  const action = "集群重名命";

  const dialog$ = useDialog(() => {
    return (
      <DialogContainer>
        <DialogHeadline>{action}</DialogHeadline>
        <DialogContent
          component={"form"}
          onSubmit={(e) => {
            e.preventDefault();
            form$.submit();
          }}
          novalidate={true}
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
          <FormControl form$={form$} />
        </DialogContent>
      </DialogContainer>
    );
  });

  rx(
    rename$,
    subscribeUntilUnmount(() => {
      dialog$.value = false;
    })
  );

  return ext(rename$, {
    action,
    form$,
    dialog$
  });
};

export const ClusterRenameBtn = component$(
  {
    cluster: t.custom<Cluster>(),
    onDidUpdate: t.custom<(c: Cluster) => void>()
  },
  (props, { emit }) => {
    const rename$ = useClusterRename(props.cluster);

    rx(
      rename$,
      subscribeUntilUnmount((resp) => emit("did-update", {
        ...props.cluster,
        name: resp.body.name
      }))
    );

    return () => {
      return (
        <AccessControl op={rename$}>
          <Tooltip title={rename$.action}>
            <IconButton onClick={() => (rename$.dialog$.value = true)}>
              <Icon path={mdiRenameBoxOutline} />
            </IconButton>
          </Tooltip>
          {rename$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);

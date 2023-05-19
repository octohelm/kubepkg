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
  type GroupEnvInfo,
  GroupEnvType,
  type GroupEnvWithCluster,
  putGroupEnv
} from "@webapp/dashboard/client/dashboard";
import {
  useDialogForm,
  Tooltip,
  IconButton,
  Icon,
  mdiPlusThick,
  mdiSquareEditOutline
} from "@nodepkg/ui";
import { AccessControl } from "@webapp/dashboard/mod/auth";

const REGEX_ID = [
  /[a-z][a-z0-9-]+/,
  "只能包含小写字符，数字与短横 -， 且必须由小写字符开头"
] as const;

export const schema = t.object({
  envName: t
    .string()
    .use(
      t.pattern(...REGEX_ID),
      FormData.label("环境名称").readOnlyWhenInitialExist()
    ),
  envType: t.nativeEnum(GroupEnvType).use(FormData.label("环境类型")),
  desc: t.string().use(FormData.label("环境描述"))
});

export const useGroupEnvPut = (
  groupName: string,
  initials?: Partial<GroupEnvInfo & { envName: string }>
) => {
  const put$ = useRequest(putGroupEnv);
  const form$ = FormData.of(schema, initials ?? {});

  rx(
    form$,
    subscribeUntilUnmount(({ envName, ...body }) => {
      put$.next({
        groupName: groupName,
        envName,
        body: body
      });
    })
  );

  rx(
    put$.error$,
    subscribeUntilUnmount((resp) => {
      form$.setErrors(FormData.errorFromRespError(resp.error));
    })
  );

  const action = initials ? "编辑环境" : "新建环境";

  const dialog$ = useDialogForm(form$, { action });

  rx(
    put$,
    subscribeUntilUnmount(() => {
      dialog$.value = false;
    })
  );

  return ext(put$, {
    action,
    form$,
    dialog$
  });
};

export const GroupEnvAddBtn = component$(
  {
    groupName: t.string(),
    onDidAdd: t.custom<(c: GroupEnvWithCluster) => void>()
  },
  (props, { emit }) => {
    const put$ = useGroupEnvPut(props.groupName);

    rx(
      put$,
      subscribeUntilUnmount((resp) => emit("did-add", resp.body))
    );

    return () => {
      return (
        <AccessControl op={put$}>
          <Tooltip title={put$.action}>
            <IconButton onClick={() => (put$.dialog$.value = true)}>
              <Icon path={mdiPlusThick} />
            </IconButton>
          </Tooltip>
          {put$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);

export const GroupEnvEditBtn = component$(
  {
    groupName: t.string(),
    groupEnv: t.custom<GroupEnvWithCluster>(),
    onDidUpdate: t.custom<(c: GroupEnvWithCluster) => void>()
  },
  (props, { emit }) => {
    const put$ = useGroupEnvPut(props.groupName, props.groupEnv);

    rx(
      put$,
      subscribeUntilUnmount((resp) => emit("did-update", resp.body))
    );

    return () => {
      return (
        <AccessControl op={put$}>
          <Tooltip title={put$.action}>
            <IconButton onClick={() => (put$.dialog$.value = true)}>
              <Icon path={mdiSquareEditOutline} />
            </IconButton>
          </Tooltip>
          {put$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);

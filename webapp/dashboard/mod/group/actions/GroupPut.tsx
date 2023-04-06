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
  type Group,
  type GroupInfo,
  GroupType,
  putGroup
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

export const REGEX_ID = [
  /[a-z][a-z0-9-]+/,
  "只能包含小写字符，数字与短横 -， 且必须由小写字符开头"
] as const;

const schema = t.object({
  name: t
    .string()
    .use(
      t.pattern(...REGEX_ID),
      FormData.label("组织名称").readOnlyWhenInitialExist()
    ),
  type: t.nativeEnum(GroupType).use(FormData.label("组织类型")),
  desc: t.string().optional().use(FormData.label("组织描述"))
});

export const useGroupPut = (
  initials?: Partial<GroupInfo & { name: string }>
) => {
  const put$ = useRequest(putGroup);
  const form$ = FormData.of(schema, initials ?? {});

  rx(
    form$,
    subscribeUntilUnmount(({ name, ...body }) => {
      put$.next({
        groupName: name,
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

  const action = initials ? "编辑组织" : "新建组织";

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

export const GroupAddBtn = component$(
  {
    onDidAdd: t.custom<(c: Group) => void>()
  },
  ({}, { emit }) => {
    const put$ = useGroupPut();

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

export const GroupEditBtn = component$(
  {
    group: t.custom<Group>(),
    onDidUpdate: t.custom<(c: Group) => void>()
  },
  (props, { emit }) => {
    const put$ = useGroupPut(props.group);

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

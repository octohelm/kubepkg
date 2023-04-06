import { t } from "@innoai-tech/typedef";
import {
  useRequest,
  component$,
  rx,
  ext,
  FormData,
  subscribeUntilUnmount
} from "@nodepkg/runtime";
import {
  createGroupRobot,
  type AccountRobot
} from "@webapp/dashboard/client/dashboard";
import {
  useDialogForm,
  Tooltip,
  IconButton,
  Icon,
  mdiPlusThick
} from "@nodepkg/ui";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import { REGEX_ID } from "./GroupPut";

const schema = t.object({
  name: t
    .string()
    .use(
      FormData.label("机器人名称").readOnlyWhenInitialExist(),
      t.pattern(...REGEX_ID)
    )
});

export const useGroupRobotAdd = (props: { groupName: string }) => {
  const create$ = useRequest(createGroupRobot);
  const form$ = FormData.of(schema, {});

  rx(
    form$,
    subscribeUntilUnmount((body) => {
      create$.next({
        groupName: props.groupName,
        body: body
      });
    })
  );

  rx(
    create$.error$,
    subscribeUntilUnmount((resp) => {
      form$.setErrors(FormData.errorFromRespError(resp.error));
    })
  );

  const action = "创建机器人";

  const dialog$ = useDialogForm(form$, { action });

  rx(
    create$,
    subscribeUntilUnmount(() => {
      dialog$.value = false;
    })
  );

  return ext(create$, {
    action,
    form$,
    dialog$
  });
};

export const GroupRobotAddBtn = component$(
  {
    groupName: t.string(),
    onDidAdd: t.custom<(c: AccountRobot) => void>()
  },
  (props, { emit }) => {
    const put$ = useGroupRobotAdd(props);

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

import { deleteGroupEnv } from "@webapp/dashboard/client/dashboard";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import {
  component$,
  useRequest,
  t,
  ext,
  rx,
  subscribeUntilUnmount,
  EventKit
} from "@nodepkg/runtime";
import {
  useDialogPrompt,
  Tooltip,
  IconButton,
  Icon,
  mdiTrashCanOutline
} from "@nodepkg/ui";

export const useGroupEnvDel = (opts: {
  groupName: string;
  envName: string;
}) => {
  const del$ = useRequest(deleteGroupEnv);

  const dialog$ = useDialogPrompt({
    $title: () => "确认删除环境",
    $content: () => opts.envName,
    onConfirm: () => {
      del$.next({ groupName: opts.groupName, envName: opts.envName });
    }
  });

  return ext(del$, {
    action: "删除环境",
    dialog$: dialog$
  });
};

export const GroupEnvDeleteBtn = component$(
  {
    groupName: t.string(),
    envName: t.string(),
    onDidDelete: t.custom<(envName: string) => void>()
  },
  (props, { emit }) => {
    const del$ = useGroupEnvDel(props);

    rx(
      del$,
      subscribeUntilUnmount(() => emit("did-delete", props.envName))
    );

    const iconButtonClick$ = EventKit.create<MouseEvent>();

    rx(
      iconButtonClick$,
      EventKit.stopPropagation(),
      subscribeUntilUnmount(() => {
        del$.dialog$.value = true;
      })
    );

    return () => {
      return (
        <AccessControl op={del$}>
          <Tooltip title={del$.action}>
            <IconButton onClick={iconButtonClick$}>
              <Icon path={mdiTrashCanOutline} />
            </IconButton>
          </Tooltip>
          {del$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);

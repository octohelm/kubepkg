import { deleteGroup } from "@webapp/dashboard/client/dashboard";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import {
  component$,
  useRequest,
  t,
  ext,
  rx,
  subscribeUntilUnmount
} from "@nodepkg/runtime";
import {
  useDialogPrompt,
  Tooltip,
  IconButton,
  Icon,
  mdiTrashCanOutline
} from "@nodepkg/ui";

export const useGroupDel = ({ groupName }: { groupName: string }) => {
  const del$ = useRequest(deleteGroup);

  const dialog$ = useDialogPrompt({
    $title: () => "确认删除组织",
    $content: () => groupName,
    onConfirm: () => {
      del$.next({ groupName });
    }
  });

  return ext(del$, {
    action: "删除组织",
    dialog$: dialog$
  });
};

export const GroupDeleteBtn = component$(
  {
    groupName: t.string(),
    onDidDelete: t.custom<() => void>()
  },
  (props, { emit }) => {
    const del$ = useGroupDel({ groupName: props.groupName });

    rx(
      del$,
      subscribeUntilUnmount(() => emit("did-delete"))
    );

    return () => {
      return (
        <AccessControl op={del$}>
          <Tooltip title={del$.action}>
            <IconButton onClick={() => (del$.dialog$.value = true)}>
              <Icon path={mdiTrashCanOutline} />
            </IconButton>
          </Tooltip>
          {del$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);

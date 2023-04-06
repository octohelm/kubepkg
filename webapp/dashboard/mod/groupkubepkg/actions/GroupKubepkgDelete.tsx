import {
  deleteKubepkgVersion,
  KubepkgChannel,
} from "@webapp/dashboard/client/dashboard";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import {
  component$,
  useRequest,
  t,
  ext,
  rx,
  subscribeUntilUnmount,
} from "@nodepkg/runtime";
import {
  useDialogPrompt,
  Tooltip,
  IconButton,
  Icon,
  mdiTrashCanOutline,
} from "@nodepkg/ui";

export const useGroupKubepkgDel = (opts: {
  groupName: string;
  kubepkgName: string;
  channel: KubepkgChannel;
  version: string;
}) => {
  const del$ = useRequest(deleteKubepkgVersion);

  const dialog$ = useDialogPrompt({
    $title: () => "确认删除版本",
    $content: () => `${opts.groupName}/${opts.kubepkgName}@${opts.version}`,

    onConfirm: () => {
      del$.next({
        groupName: opts.groupName,
        name: opts.kubepkgName,
        channel: opts.channel,
        version: opts.version,
      });
    },
  });

  return ext(del$, {
    action: "删除版本",
    dialog$: dialog$,
  });
};

export const GroupKubepkgDeleteBtn = component$(
  {
    groupName: t.string(),
    kubepkgName: t.string(),
    channel: t.nativeEnum(KubepkgChannel),
    version: t.string(),
    onDidDelete: t.custom<() => void>(),
  },
  (props, { emit }) => {
    const del$ = useGroupKubepkgDel(props);

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

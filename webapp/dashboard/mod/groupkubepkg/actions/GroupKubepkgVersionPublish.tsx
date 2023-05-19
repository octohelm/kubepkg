import {
  putKubepkgVersion,
  KubepkgChannel,
  type KubepkgVersionInfo
} from "@webapp/dashboard/client/dashboard";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import {
  component$,
  useRequest,
  t,
  ext,
  rx,
  ref,
  subscribeUntilUnmount
} from "@nodepkg/runtime";
import {
  useDialogPrompt,
  Tooltip,
  IconButton,
  Icon,
  mdiPublish,
  Menu,
  MenuItem
} from "@nodepkg/ui";
import { map } from "@nodepkg/runtime/lodash";

export const useGroupKubepkgPublish = (
  channel: () => KubepkgChannel,
  opts: {
    groupName: string;
    kubepkgName: string;
    versionInfo: KubepkgVersionInfo;
  }
) => {
  const put$ = useRequest(putKubepkgVersion);

  const dialog$ = useDialogPrompt({
    $title: () => `确认发布版本到 ${channel()} 通道`,
    $content: () => `${opts.groupName}/${opts.kubepkgName}@${opts.versionInfo.version}`,

    onConfirm: () => {
      put$.next({
        groupName: opts.groupName,
        name: opts.kubepkgName,
        channel: channel(),
        body: opts.versionInfo
      });
    }
  });

  return ext(put$, {
    action: "发布版本到",
    dialog$: dialog$
  });
};

export const GroupKubepkgVersionPublishBtn = component$(
  {
    groupName: t.string(),
    kubepkgName: t.string(),
    fromChannel: t.nativeEnum(KubepkgChannel),
    versionInfo: t.custom<KubepkgVersionInfo>(),
    onDidPublish: t.custom<() => void>()
  },
  (props, { emit }) => {
    const chanelRef = ref(props.fromChannel);

    const allowChannels = (fromChannel: KubepkgChannel) => {
      const channels = [
        KubepkgChannel.DEV,
        KubepkgChannel.BETA,
        KubepkgChannel.RC,
        KubepkgChannel.STABLE
      ];
      return channels.slice(channels.indexOf(fromChannel) + 1);
    };

    const publish$ = useGroupKubepkgPublish(() => chanelRef.value, props);

    rx(
      publish$,
      subscribeUntilUnmount(() => emit("did-publish"))
    );

    return () => {
      return (
        <AccessControl op={publish$}>
          <Tooltip title={publish$.action}>
            <Menu
              placement={"bottom-end"}
              onSelected={(v) => {
                chanelRef.value = v as KubepkgChannel;
                publish$.dialog$.value = true;
              }}
              $menu={
                <>
                  {map(allowChannels(props.fromChannel), (c) => {
                    return <MenuItem key={c} data-value={c}>{c}</MenuItem>;
                  })}
                </>
              }
            >
              <IconButton>
                <Icon path={mdiPublish} />
              </IconButton>
            </Menu>
          </Tooltip>
          {publish$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);

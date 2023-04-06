import {
  GroupRoleType,
  refreshGroupRobotToken,
  type AuthToken,
} from "@webapp/dashboard/client/dashboard";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import {
  component$,
  useRequest,
  t,
  rx,
  render,
  subscribeUntilUnmount,
  observableRef,
} from "@nodepkg/runtime";
import {
  useDialogPrompt,
  Tooltip,
  IconButton,
  Icon,
  mdiKeyPlus,
  CopyToClipboard,
  useNotify,
} from "@nodepkg/ui";

export const GroupRobotTokenRefreshBtn = component$(
  {
    groupName: t.string(),
    robotID: t.string(),
  },
  (props, {}) => {
    const token$ = observableRef<AuthToken | null>(null);
    const notify = useNotify();

    const tokenEl = rx(
      token$,
      render((token) => (
        <CopyToClipboard
          component={"pre"}
          sx={{
            m: 0,
            p: 8,
            maxWidth: "50vw",
            overflow: "auto",
            rounded: "sm",
            containerStyle: "sys.surface-container-low",
          }}
          content={token?.accessToken ?? ""}
          onDidCopy={() => {
            notify("复制成功");
          }}
        >
          <code>{token?.accessToken}</code>
        </CopyToClipboard>
      ))
    );

    const dialog$ = useDialogPrompt({
      $title: () => "Robot 访问凭证",
      $content: () => (
        <div>
          {tokenEl}
          <p>点击复制，请妥善保管</p>
        </div>
      ),
    });

    const refresh$ = useRequest(refreshGroupRobotToken);

    rx(
      refresh$,
      subscribeUntilUnmount((resp) => {
        token$.value = resp.body;
        dialog$.value = true;
      })
    );

    return () => {
      return (
        <AccessControl op={refresh$}>
          <Tooltip title={"创建访问凭证"}>
            <IconButton
              onClick={() =>
                refresh$.next({
                  groupName: props.groupName,
                  robotID: props.robotID,
                  body: {
                    roleType: GroupRoleType.MEMBER,
                    expiresIn: 30 * 24 * 60 * 60,
                  },
                })
              }
            >
              <Icon path={mdiKeyPlus} />
            </IconButton>
          </Tooltip>
          {dialog$.elem}
        </AccessControl>
      );
    };
  }
);

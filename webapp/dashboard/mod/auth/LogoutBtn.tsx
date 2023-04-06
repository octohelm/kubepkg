import {
  component
} from "@nodepkg/runtime";
import { Tooltip, IconButton, Icon, mdiLogoutVariant } from "@nodepkg/ui";
import { TokenProvider } from "./TokenProvider";

export const LogoutBtn = component(() => {
  const token = TokenProvider.use();

  return () => (
    <Tooltip title={"退出登录"}>
      <IconButton onClick={() => token.logout()}>
        <Icon path={mdiLogoutVariant} />
      </IconButton>
    </Tooltip>
  );
});

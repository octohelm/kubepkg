import { component, RouterLink } from "@nodepkg/runtime";
import { IconButton, Icon, Tooltip, mdiTuneVertical } from "@nodepkg/ui";
import { MustAdmin, MustLogon } from "@webapp/dashboard/mod/auth";
import { GroupCardList } from "@webapp/dashboard/mod/group";
import { Scaffold } from "@webapp/dashboard/layout";

export default component(() => () => (
  <MustLogon>
    <Scaffold
      $action={
        <MustAdmin>
          <Tooltip title={"系统管理"}>
            <IconButton component={RouterLink} to={"/admin"}>
              <Icon path={mdiTuneVertical} />
            </IconButton>
          </Tooltip>
        </MustAdmin>
      }
    >
      <GroupCardList />
    </Scaffold>
  </MustLogon>
));
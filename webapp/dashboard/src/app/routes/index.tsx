import { IconButtonWithTooltip } from "src/layout";
import { GroupCardList } from "src/group";
import { Link } from "@nodepkg/router";
import { Build } from "@mui/icons-material";
import { Scaffold } from "src/app/layout";
import { MustLogon } from "../../auth";

export default () => (
  <MustLogon>
    <Scaffold
      toolbar={
        <IconButtonWithTooltip
          label="系统管理"
          color="inherit"
          component={Link}
          to={"/admin"}
        >
          <Build />
        </IconButtonWithTooltip>
      }
    >
      <GroupCardList />
    </Scaffold>
  </MustLogon>
)

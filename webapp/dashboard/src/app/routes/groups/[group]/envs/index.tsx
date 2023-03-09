import { WorkspacesOutlined } from "@mui/icons-material";
import { Scaffold } from "src/app/layout";

import { GroupEnvList, GroupEnvMainToolbar } from "src/group-env";

export const title = "环境";
export const icon = <WorkspacesOutlined />;

export default (() => (
  <Scaffold toolbar={<GroupEnvMainToolbar />}>
    <GroupEnvList />
  </Scaffold>
));

import { WorkspacesOutlined } from "@mui/icons-material";
import { Scaffold } from "src/app/layout";

import { GroupList, GroupMainToolbar } from "src/group";

export const title = "组织";
export const icon = <WorkspacesOutlined />;

export default (() => (
  <Scaffold toolbar={<GroupMainToolbar />}>
    <GroupList />
  </Scaffold>
));
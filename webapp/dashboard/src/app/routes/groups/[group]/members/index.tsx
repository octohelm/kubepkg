import { PeopleOutlined } from "@mui/icons-material";
import {
  GroupAccountAdd,
  GroupAccountList,
  GroupAccountProvider
} from "src/group";

import { Scaffold } from "src/app/layout";

export const title = "成员";
export const icon = <PeopleOutlined />;

export default (() => {
  return (
    <GroupAccountProvider>
      <Scaffold action={<GroupAccountAdd />}>
        <GroupAccountList />
      </Scaffold>
    </GroupAccountProvider>
  );
});

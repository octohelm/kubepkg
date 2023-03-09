import { PeopleOutlined } from "@mui/icons-material";
import { AccountList } from "src/account";

import { Scaffold } from "src/app/layout";

export const icon = <PeopleOutlined />;
export const title = "用户";

export default (() => {
  return (
    <Scaffold>
      <AccountList />
    </Scaffold>
  );
});


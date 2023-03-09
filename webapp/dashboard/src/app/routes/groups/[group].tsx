import { Outlet } from "@nodepkg/router";

import { GlobalGroupProvider, GroupTitle } from "src/group";

export const title = <GroupTitle />;

export default (() => {
  return (
    <GlobalGroupProvider>
      <Outlet />
    </GlobalGroupProvider>
  );
});
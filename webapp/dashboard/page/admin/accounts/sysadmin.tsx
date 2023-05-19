import { Scaffold } from "@webapp/dashboard/layout";
import { component } from "@nodepkg/runtime";
import { AdminAccountList } from "@webapp/dashboard/mod/account";

/**
 * @property {"系统管理员"} meta.name
 */
export default component(() => () => (
  <Scaffold>
    <AdminAccountList />
  </Scaffold>
));


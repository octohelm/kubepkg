import { Scaffold } from "@webapp/dashboard/layout";
import { component } from "@nodepkg/runtime";
import { AccountList } from "@webapp/dashboard/mod/account";

/**
 * @property {"用户"} meta.name
 * @property {import("@nodepkg/ui").mdiAccountCircle} meta.icon
 */
export default component(() => () => (
  <Scaffold>
    <AccountList />
  </Scaffold>
));


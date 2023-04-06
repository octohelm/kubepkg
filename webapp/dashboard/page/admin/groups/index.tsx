import { component } from "@nodepkg/runtime";
import { Scaffold } from "@webapp/dashboard/layout";
import { GroupCardListForAdmin } from "@webapp/dashboard/mod/group";

/**
 * @property {"组织"} meta.name
 * @property {import("@nodepkg/ui").mdiAccountGroupOutline} meta.icon
 */
export default component(() => () => (
  <Scaffold>
    <GroupCardListForAdmin />
  </Scaffold>
));


import { component } from "@nodepkg/runtime";
import { GroupAccountList } from "@webapp/dashboard/mod/group";


/**
 * @property {"成员"} meta.name
 * @property {import("@nodepkg/ui").mdiAccountMultiple} meta.icon
 */
export default component(() => {
  return () => {
    return <GroupAccountList />;
  };
});

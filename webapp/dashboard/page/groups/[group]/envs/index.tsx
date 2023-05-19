import { component } from "@nodepkg/runtime";
import { GroupEnvList } from "@webapp/dashboard/mod/groupenv";

/**
 * @property {"环境"} meta.name
 * @property {import("@nodepkg/ui").mdiGroup} meta.icon
 * @property {import("@webapp/dashboard/mod/groupenv").GroupEnvMenu} meta.menu
 */
export default component(() => {
  return () => {
    return <GroupEnvList />;
  };
});

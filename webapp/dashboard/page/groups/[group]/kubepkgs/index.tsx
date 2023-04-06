import { component } from "@nodepkg/runtime";
import { GroupKubepkgList } from "@webapp/dashboard/mod/groupkubepkg";

/**
 * @property {"应用"} meta.name
 * @property {import("@nodepkg/ui").mdiAppsBox} meta.icon
 */
export default component(() => {
  return () => {
    return <GroupKubepkgList />;
  };
});

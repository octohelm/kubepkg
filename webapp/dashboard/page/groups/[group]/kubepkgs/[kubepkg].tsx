import { component, t } from "@nodepkg/runtime";
import { GroupKubepkgVersionList } from "@webapp/dashboard/mod/groupkubepkg";

/**
 * @property {true} meta.hidden
 */
export default component(
  {
    group: t.string(),
    kubepkg: t.string()
  },
  (props) => {
    return () => {
      return (
        <GroupKubepkgVersionList kubepkgName={props.kubepkg} />
      );
    };
  }
);

import { component } from "@nodepkg/runtime";
import { GroupRobotList } from "@webapp/dashboard/mod/group";

/**
 * @property {"机器人"} meta.name
 */
export default component(() => {
  return () => {
    return <GroupRobotList />;
  };
});

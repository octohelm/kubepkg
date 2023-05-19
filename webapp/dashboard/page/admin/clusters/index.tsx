import { Scaffold } from "@webapp/dashboard/layout";
import { component } from "@nodepkg/runtime";
import { ClusterList } from "@webapp/dashboard/mod/cluster";

/**
 * @property {"集群"} meta.name
 * @property {import("@nodepkg/ui").mdiCloudCircle} meta.icon
 */
export default component(() => () => (
  <Scaffold>
    <ClusterList />
  </Scaffold>
));


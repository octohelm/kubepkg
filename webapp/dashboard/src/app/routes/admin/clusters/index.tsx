import { CloudOutlined } from "@mui/icons-material";
import { ClusterList, ClusterMainToolbar } from "src/cluster";
import { Scaffold } from "src/app/layout";


export const title = "集群";
export const icon = <CloudOutlined />;

export default (() => (
  <Scaffold toolbar={<ClusterMainToolbar />}>
    <ClusterList />
  </Scaffold>
));
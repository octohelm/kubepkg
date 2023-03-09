import { AppsOutlined } from "@mui/icons-material";
import { GroupKubepkgList, KubePkgSearch } from "src/kubepkg";
import { GroupKubePkgProvider } from "src/kubepkg/domain";

import { Scaffold } from "src/app/layout";

export const title = "应用";
export const icon = <AppsOutlined />;

export default (() => {
  return (
    <GroupKubePkgProvider>
      <Scaffold action={<KubePkgSearch />}>
        <GroupKubepkgList />
      </Scaffold>
    </GroupKubePkgProvider>
  );
});
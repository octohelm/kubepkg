import { useParams } from "react-router";
import { GroupEnvDeploymentsProvider, GroupEnvProvider } from "../group";
import { IconButtonWithTooltip, Scaffold } from "../layout";
import { GroupEnvDeploymentList } from "./GroupEnvDeploymentList";
import { useGroupEnvDeploymentFormWithDialog } from "./GroupEnvDeployementForm";
import { AccessControl } from "../auth";
import { AddCircleOutlineOutlined } from "@mui/icons-material";
import { GroupEnvCluster } from "./GroupEnvCluster";
import Stack from "@mui/system/Stack";

export const GroupEnvDeploymentMainToolbar = () => {
  const form$ = useGroupEnvDeploymentFormWithDialog();

  return (
    <AccessControl op={form$}>
      <IconButtonWithTooltip
        label={"创建 KubePkg"}
        size="large"
        color="inherit"
        onClick={() => form$.dialog$.next(true)}
      >
        <AddCircleOutlineOutlined />
      </IconButtonWithTooltip>
      {form$.dialog$.render()}
    </AccessControl>
  );
};

export const GroupEnvDeploymentMain = () => {
  const params = useParams();

  return (
    <GroupEnvProvider groupName={params["group"]!} envName={params["env"]!}>
      <GroupEnvDeploymentsProvider>
        <Scaffold toolbar={<GroupEnvDeploymentMainToolbar />}>
          <Stack spacing={2}>
            <GroupEnvCluster />
            <GroupEnvDeploymentList />
          </Stack>
        </Scaffold>
      </GroupEnvDeploymentsProvider>
    </GroupEnvProvider>
  );
};

import { Box, Divider, Stack } from "@mui/material";
import { useParams } from "@nodepkg/router";
import { Scaffold } from "src/app/layout/Scaffold";
import {
  GroupEnvDeploymentExport,
  GroupEnvDeploymentList,
  GroupEnvCluster,
  GroupEnvDeploymentMainToolbar,
  GroupEnvMenu
} from "src/group-env";
import {
  GroupEnvDeploymentsProvider,
  GroupEnvProvider
} from "src/group";


export const menu = <GroupEnvMenu />;

export default (() => {
  const params = useParams();

  return (
    <GroupEnvProvider groupName={params["group"]!} envName={params["env"]!}>
      <GroupEnvDeploymentsProvider>
        <Scaffold toolbar={<GroupEnvDeploymentMainToolbar />}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={2}>
              <GroupEnvCluster />
              <Box sx={{ flex: 1 }} />
              <GroupEnvDeploymentExport />
            </Stack>
            <Divider />
            <GroupEnvDeploymentList />
          </Stack>
        </Scaffold>
      </GroupEnvDeploymentsProvider>
    </GroupEnvProvider>
  );
});


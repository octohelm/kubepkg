import { useParams } from "@nodepkg/router";
import { GroupEnvDeploymentsProvider, GroupEnvProvider } from "../group";
import { IconButtonWithTooltip, Slot, Scaffold } from "../layout";
import {
  GroupEnvDeploymentExport,
  GroupEnvDeploymentList
} from "./GroupEnvDeploymentList";
import { useGroupEnvDeploymentPutWithDialog } from "./GroupEnvDeployementActions";
import { AccessControl } from "../auth";
import { AddCircleOutlineOutlined } from "@mui/icons-material";
import { GroupEnvCluster } from "./GroupEnvCluster";
import { Divider, Box, Stack } from "@mui/material";

export const GroupEnvDeploymentMainToolbar = () => {
  const form$ = useGroupEnvDeploymentPutWithDialog();

  return (
    <AccessControl op={form$}>
      <IconButtonWithTooltip
        title={"创建 KubePkg"}
        size="large"
        color="inherit"
        onClick={() => form$.dialog$.next(true)}
      >
        <AddCircleOutlineOutlined />
      </IconButtonWithTooltip>
      <Slot elem$={form$.dialog$.elements$} />
    </AccessControl>
  );
};

export const GroupEnvDeploymentMain = () => {
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
};

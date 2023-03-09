import { IconButtonWithTooltip, Slot } from "../layout";
import { useGroupEnvDeploymentPutWithDialog } from "./GroupEnvDeployementActions";
import { AccessControl } from "../auth";
import { AddCircleOutlineOutlined } from "@mui/icons-material";

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


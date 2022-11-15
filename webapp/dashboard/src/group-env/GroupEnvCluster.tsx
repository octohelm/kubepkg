import { Subscribe } from "@innoai-tech/reactutil";
import { Box } from "@mui/material";
import { GroupEnvProvider } from "../group";


export const GroupEnvCluster = () => {
  const groupEnv$ = GroupEnvProvider.use$();

  return (
    <Subscribe value$={groupEnv$}>
      {(groupEnv) => {

        return <Box>{groupEnv.groupName}</Box>;
      }}
    </Subscribe>
  );
};
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Typography
} from "@mui/material";
import { Link } from "@nodepkg/router";
import { GroupEnv, GroupEnvType } from "../client/dashboard";
import { OpenInNew } from "@mui/icons-material";
import type { ReactNode } from "react";

export const GroupEnvCard = ({
                               groupName,
                               groupEnv,
                               actions
                             }: {
  groupName: string
  groupEnv: GroupEnv;
  actions?: ReactNode;
}) => {
  return (
    <Card sx={{ minWidth: 300 }}>
      <CardHeader
        title={
          <Box sx={{ fontSize: "0.6em" }}>
            <Chip
              label={groupEnv.envType}
              color={groupEnv.envType === GroupEnvType.ONLINE ? "error" : "primary"}
              size="small"
              variant="outlined"
            />
          </Box>
        }
        action={
          <IconButton component={Link} to={`/groups/${groupName}/envs/${groupEnv.envName}`}>
            <OpenInNew />
          </IconButton>
        }
      />
      <CardContent>
        <Typography gutterBottom={true} variant="h5">
          {groupEnv.envName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {groupEnv.desc}&nbsp;
        </Typography>
      </CardContent>
      {actions && <CardActions disableSpacing>
        {actions}
      </CardActions>}
    </Card>
  );
};

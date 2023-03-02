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
import { Group, GroupType } from "../client/dashboard";
import { OpenInNew } from "@mui/icons-material";
import type { ReactNode } from "react";

export const GroupCard = ({
                            group,
                            actions
                          }: {
  group: Group;
  actions?: ReactNode;
}) => {
  return (
    <Card sx={{ minWidth: 300 }}>
      <CardHeader
        title={
          <Box sx={{ fontSize: "0.6em" }}>
            <Chip
              label={group.type}
              color={group.type === GroupType.DEPLOYMENT ? "error" : "primary"}
              size="small"
              variant="outlined"
            />
          </Box>
        }
        action={
          <IconButton component={Link} to={`/groups/${group.name}`}>
            <OpenInNew />
          </IconButton>
        }
      />
      <CardContent>
        <Typography gutterBottom={true} variant="h5">
          {group.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {group.desc}&nbsp;
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        {actions}
      </CardActions>
    </Card>
  );
};

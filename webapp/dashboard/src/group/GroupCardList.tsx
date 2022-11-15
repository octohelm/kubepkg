import { useObservable, useRequest } from "@innoai-tech/reactutil";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
import { Group, listGroup } from "../client/dashboard";

export const GroupCard = ({ group }: { group: Group }) => {
  return (
    <Card sx={{ minWidth: 280 }}>
      <CardContent>
        <Typography gutterBottom={true} variant="h5" component="div">
          {group.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {group.desc}
        </Typography>
      </CardContent>
      <CardActions>
        <Box flex={1} />
        <Button component={Link} to={`/groups/${group.name}`}>
          访问
        </Button>
      </CardActions>
    </Card>
  );
};

export const GroupCardList = () => {
  const listGroup$ = useRequest(listGroup);

  useEffect(() => {
    listGroup$.next({});
  }, []);

  const resp = useObservable(listGroup$);

  if (!resp) {
    return null;
  }

  return (
    <Stack direction="row" spacing={2}>
      {resp.body?.map((group) => {
        return (
          <Fragment key={group.groupID}>
            <GroupCard group={group} />
          </Fragment>
        );
      })}
    </Stack>
  );
};
import { useObservableState, useRequest } from "@nodepkg/runtime";
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { Fragment, useEffect } from "react";
import { listAccount, AccountUser } from "../client/dashboard";
import { Scaffold, stringAvatar } from "../layout";

export const AccountListItem = ({ user }: { user: AccountUser }) => {
  return (
    <>
      <ListItem>
        <ListItemAvatar>
          <Avatar variant="rounded">{stringAvatar(user.nickname)}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<Box>{`${user.nickname}`}</Box>}
          secondary={
            <Box component="span" sx={{ display: "inline" }}>
              {user.email}
            </Box>
          }
        />
      </ListItem>
    </>
  );
};

const AccountList = () => {
  const listAccount$ = useRequest(listAccount);

  useEffect(() => {
    listAccount$.next({});
  }, []);

  const resp = useObservableState(listAccount$);

  if (!resp) {
    return null;
  }

  return (
    <List>
      {resp.body?.data.map((account, i) => {
        return (
          <Fragment key={account.accountID}>
            {i > 0 && <Divider component="li" />}
            <AccountListItem user={account} />
          </Fragment>
        );
      })}
    </List>
  );
};

export const AccountMain = () => {
  return (
    <Scaffold>
      <AccountList />
    </Scaffold>
  );
};

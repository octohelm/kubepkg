import { useObservable, useObservableEffect } from "@innoai-tech/reactutil";
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { Fragment, useEffect } from "react";
import { tap, filter } from "rxjs/operators";
import { GroupRoleType, GroupUser } from "../client/dashboard";
import { Scaffold, stringAvatar } from "../layout";
import { useAccountAutocomplete } from "../account";
import { AccessControl } from "../auth";
import { map } from "@innoai-tech/lodash";
import { GroupAccountProvider } from "./domain";

const GroupAccountListItem = ({ user }: { user: GroupUser }) => {
  const account$ = GroupAccountProvider.use$();

  return (
    <>
      <ListItem
        secondaryAction={
          <AccessControl op={account$.put$}>
            {(ok) => (
              <Select
                value={user.roleType}
                disabled={!ok}
                size={"small"}
                onChange={(evt) => {
                  const roleType = evt.target.value as typeof user.roleType;

                  if ((roleType as any) === "-") {
                    account$.del$.next({
                      groupName: account$.groupName,
                      accountID: user.accountID,
                    });
                    return;
                  }

                  account$.put$.next({
                    groupName: account$.groupName,
                    accountID: user.accountID,
                    body: {
                      roleType,
                    },
                  });
                }}
              >
                {[
                  ...map(GroupRoleType, (role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  )),
                  <AccessControl key={"-"} op={account$.del$}>
                    <Divider />,
                    <MenuItem key={""} value={"-"}>
                      移除成员
                    </MenuItem>
                  </AccessControl>,
                ]}
              </Select>
            )}
          </AccessControl>
        }
      >
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

const GroupAccountList = () => {
  const account$ = GroupAccountProvider.use$();

  useEffect(() => {
    account$.list$.next({
      groupName: account$.groupName,
    });
  }, []);

  const accountDataList = useObservable(account$);

  return (
    <List>
      {accountDataList?.data?.map((account, i) => {
        return (
          <Fragment key={account.accountID}>
            {i > 0 && <Divider component="li" />}
            <GroupAccountListItem user={account} />
          </Fragment>
        );
      })}
    </List>
  );
};

export const GroupAccountAdd = () => {
  const account$ = GroupAccountProvider.use$();

  const accountSearch$ = useAccountAutocomplete({
    placeholder: "查询并添加成员",
  });

  useObservableEffect(
    () => [
      account$.put$.pipe(
        tap(() => {
          accountSearch$.popper$.next(false);
        })
      ),
      accountSearch$.pipe(
        filter((accountID) => !!accountID),
        tap((accountID) => {
          account$.put$.next({
            groupName: account$.groupName,
            accountID,
            body: {
              roleType: GroupRoleType.GUEST,
            },
          });
        })
      ),
    ],
    []
  );

  return (
    <AccessControl op={account$.put$}>{accountSearch$.render()}</AccessControl>
  );
};

export const GroupAccountMain = () => {
  return (
    <GroupAccountProvider>
      <Scaffold action={<GroupAccountAdd />}>
        <GroupAccountList />
      </Scaffold>
    </GroupAccountProvider>
  );
};

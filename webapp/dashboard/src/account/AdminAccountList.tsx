import {
  useObservable,
  useObservableEffect,
  useRequest,
} from "@innoai-tech/reactutil";
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
import { map as rxMap, tap, ignoreElements, filter } from "rxjs";
import {
  deleteAdminAccount,
  GroupRoleType,
  GroupUser,
  listAdminAccount,
  putAdminAccount,
} from "../client/dashboard";
import { createSubject, Scaffold, stringAvatar } from "../layout";
import { useAccountAutocomplete } from "./AccountAutocomplete";
import { AccessControl } from "../auth";
import { map } from "@innoai-tech/lodash";

export const AdminAccountProvider = createSubject(({}, use) => {
  const listAccount$ = useRequest(listAdminAccount);
  const putAdminAccount$ = useRequest(putAdminAccount);
  const deleteAdminAccount$ = useRequest(deleteAdminAccount);

  return use(
    {} as typeof listAdminAccount.TRespData,
    {
      list$: listAccount$,
      del$: deleteAdminAccount$,
      put$: putAdminAccount$,
    },
    (accounts$) =>
      accounts$.put$.pipe(
        tap(() => {
          accounts$.list$.next({});
        }),
        ignoreElements()
      ),
    (accounts$) =>
      accounts$.del$.pipe(
        tap(() => {
          accounts$.list$.next({});
        }),
        ignoreElements()
      ),
    (accounts$) => accounts$.list$.pipe(rxMap((resp) => resp.body))
  );
});

const AdminAccountListItem = ({ user }: { user: GroupUser }) => {
  const account$ = AdminAccountProvider.use$();

  return (
    <>
      <ListItem
        secondaryAction={
          <AccessControl op={account$.put$}>
            <Select
              value={user.roleType}
              size={"small"}
              onChange={(evt) => {
                const roleType = evt.target.value as typeof user.roleType;

                if (roleType === user.roleType) {
                  return;
                }

                if (roleType !== GroupRoleType.GUEST) {
                  account$.put$.next({
                    accountID: user.accountID,
                    body: {
                      roleType,
                    },
                  });
                } else {
                  account$.del$.next({
                    accountID: user.accountID,
                  });
                }
              }}
            >
              {[
                ...map(GroupRoleType, (role) =>
                  GroupRoleType.GUEST === role ? null : (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  )
                ),
                <AccessControl key={"--"} op={account$.del$}>
                  <Divider />,
                  <MenuItem
                    key={GroupRoleType.GUEST}
                    value={GroupRoleType.GUEST}
                  >
                    移除管理员
                  </MenuItem>
                </AccessControl>,
              ]}
            </Select>
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

const AdminAccountList = () => {
  const account$ = AdminAccountProvider.use$();

  useEffect(() => {
    account$.list$.next({});
  }, []);

  const accountDataList = useObservable(account$);

  return (
    <List>
      {accountDataList?.data?.map((account, i) => {
        return (
          <Fragment key={account.accountID}>
            {i > 0 && <Divider component="li" />}
            <AdminAccountListItem user={account} />
          </Fragment>
        );
      })}
    </List>
  );
};

export const AdminAdd = () => {
  const account$ = AdminAccountProvider.use$();

  const accountAutocomplete$ = useAccountAutocomplete({
    placeholder: "查询并添加管理员",
  });

  useObservableEffect(
    () => [
      account$.put$.pipe(
        tap(() => {
          accountAutocomplete$.popper$.next(false);
        })
      ),
      accountAutocomplete$.pipe(
        filter((accountID) => !!accountID),
        tap((accountID) => {
          account$.put$.next({
            accountID,
            body: {
              roleType: GroupRoleType.MEMBER,
            },
          });
        })
      ),
    ],
    []
  );

  return (
    <AccessControl op={account$.put$}>
      {accountAutocomplete$.render()}
    </AccessControl>
  );
};

export const AdminAccountMain = () => {
  return (
    <AdminAccountProvider>
      <Scaffold action={<AdminAdd />}>
        <AdminAccountList />
      </Scaffold>
    </AdminAccountProvider>
  );
};

import {
  t,
  component,
  component$,
  useRequest,
  rx,
  observableRef,
  subscribeUntilUnmount,
  onMounted,
  Fragment
} from "@nodepkg/runtime";
import {
  Menu,
  MenuItem,
  ListItem,
  styled,
  Icon,
  Box,
  mdiSwapHorizontal
} from "@nodepkg/ui";
import {
  type GroupUser,
  listAdminAccount,
  putAdminAccount,
  deleteAdminAccount,
  GroupRoleType
} from "@webapp/dashboard/client/dashboard";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import { map } from "@nodepkg/runtime/lodash";
import { Container } from "@webapp/dashboard/layout";
import { AccountAutocompleteBtn } from "@webapp/dashboard/mod/account";

const Chip = styled("span")({
  px: 10,
  h: 18,
  rounded: 18,
  textStyle: "sys.body-small",
  containerStyle: "sys.primary-container",
  display: "inline-flex",
  alignItems: "center"
});

export const GroupTypeOrControl = component(
  {
    user: t.custom<GroupUser>(),
    onUpdated: t.custom<(updated: GroupUser | null) => void>()
  },
  (props, { emit }) => {
    const put$ = useRequest(putAdminAccount);
    const del$ = useRequest(deleteAdminAccount);

    rx(
      put$,
      subscribeUntilUnmount((resp) => {
        emit("updated", {
          ...props.user,
          roleType: resp.body.roleType,
          updatedAt: resp.body.updatedAt
        });
      })
    );

    rx(
      del$,
      subscribeUntilUnmount(() => {
        emit("updated", null);
      })
    );

    return () => {
      return (
        <AccessControl op={put$} renderWithDisabled>
          <Menu
            placement={"bottom-start"}
            onSelected={(value) => {
              if (value != "-") {
                if (value !== props.user.roleType) {
                  put$.next({
                    accountID: props.user.accountID,
                    body: {
                      roleType: value as GroupRoleType
                    }
                  });
                }
              } else {
                del$.next({
                  accountID: props.user.accountID
                });
              }
            }}
            $menu={
              <>
                {map(GroupRoleType, (role) =>
                  GroupRoleType.GUEST === role ? null : (
                    <MenuItem
                      key={role}
                      active={role === props.user.roleType}
                      data-value={role}
                    >
                      {role}
                    </MenuItem>
                  )
                )}
                <MenuItem key={"-"} data-value={"-"}>
                  移除
                </MenuItem>
              </>
            }
          >
            <Chip component={"label"}>
              {props.user.roleType}
              <Icon
                path={mdiSwapHorizontal}
                sx={{
                  "[data-disabled=true] &": {
                    display: "none"
                  }
                }}
              />
            </Chip>
          </Menu>
        </AccessControl>
      );
    };
  }
);

export const AdminAccountListItem = component$(
  {
    user: t.custom<GroupUser>()
  },
  (props, { render }) => {
    const user$ = observableRef<GroupUser | null>(props.user);

    rx(
      props.user$,
      subscribeUntilUnmount((user) => {
        user$.value = user;
      })
    );

    return rx(
      user$,
      render((user) => {
        if (!user) {
          return null;
        }

        return (
          <ListItem
            $heading={
              <Box sx={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{user.nickname}</span>
                <GroupTypeOrControl
                  user={user}
                  onUpdated={(user) => {
                    user$.value = user;
                  }}
                />
              </Box>
            }
            $supporting={<span>{user.email}</span>}
          />
        );
      })
    );
  }
);

export const AdminAccountList = component$(({}, { render }) => {
  const list$ = useRequest(listAdminAccount);
  const put$ = useRequest(putAdminAccount);

  const fetch = () =>
    list$.next({
      size: -1
    });

  onMounted(() => {
    fetch();
  });

  rx(
    put$,
    subscribeUntilUnmount(() => fetch())
  );

  const listEl = rx(
    list$,
    render((resp) => {
      return resp?.body?.data.map((account) => {
        return (
          <Fragment key={account.accountID}>
            <AdminAccountListItem user={account} />
          </Fragment>
        );
      });
    })
  );

  return () => (
    <Container
      $action={
        <AccessControl op={put$}>
          <AccountAutocompleteBtn
            title={"添加管理员"}
            onSelected={(accountId, done) => {
              put$.next({
                accountID: accountId,
                body: {
                  roleType: GroupRoleType.MEMBER
                }
              });
              done();
            }}
          />
        </AccessControl>
      }
    >
      {listEl}
    </Container>
  );
});

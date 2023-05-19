import {
  t,
  component,
  component$,
  useRequest,
  rx,
  observableRef,
  subscribeUntilUnmount,
  onMounted
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
  listGroupAccount,
  putGroupAccount,
  deleteGroupAccount,
  GroupRoleType
} from "@webapp/dashboard/client/dashboard";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import { map } from "@nodepkg/runtime/lodash";
import { Container } from "@webapp/dashboard/layout";
import { AccountAutocompleteBtn } from "@webapp/dashboard/mod/account";
import { GroupProvider } from "@webapp/dashboard/mod/group/GroupContext";

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
    groupName: t.string(),
    user: t.custom<GroupUser>(),
    onUpdated: t.custom<(updated: GroupUser | null) => void>()
  },
  (props, { emit }) => {
    const put$ = useRequest(putGroupAccount);
    const del$ = useRequest(deleteGroupAccount);

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
                    groupName: props.groupName,
                    accountID: props.user.accountID,
                    body: {
                      roleType: value as GroupRoleType
                    }
                  });
                }
              } else {
                del$.next({
                  groupName: props.groupName,
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

export const GroupAccountListItem = component$(
  {
    groupName: t.string(),
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
                  groupName={props.groupName}
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

export const GroupAccountList = component$(({}, { render }) => {
  const group$ = GroupProvider.use();

  const list$ = useRequest(listGroupAccount);
  const put$ = useRequest(putGroupAccount);

  const fetch = () =>
    list$.next({
      groupName: group$.value.name,
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
          <GroupAccountListItem
            key={account.accountID}
            groupName={group$.value.name}
            user={account}
          />
        );
      });
    })
  );

  return () => (
    <Container
      $action={
        <AccessControl op={put$}>
          <AccountAutocompleteBtn
            title={"添加成员"}
            onSelected={(accountId, done) => {
              put$.next({
                groupName: group$.value.name,
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

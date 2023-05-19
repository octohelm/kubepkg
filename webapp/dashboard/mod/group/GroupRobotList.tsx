import {
  t,
  component$,
  useRequest,
  rx,
  observableRef,
  subscribeUntilUnmount,
  onMounted
} from "@nodepkg/runtime";
import { ListItem, Box } from "@nodepkg/ui";
import {
  type GroupRobot,
  listGroupRobot
} from "@webapp/dashboard/client/dashboard";
import { Container } from "@webapp/dashboard/layout";
import { GroupProvider } from "@webapp/dashboard/mod/group/GroupContext";
import { GroupRobotAddBtn } from "@webapp/dashboard/mod/group/actions";
import { GroupRobotTokenRefreshBtn } from "@webapp/dashboard/mod/group/actions/GroupRobotTokenRefresh";

export const GroupRobotListItem = component$(
  {
    groupName: t.string(),
    robot: t.custom<GroupRobot>()
  },
  (props, { render }) => {
    const robot$ = observableRef<GroupRobot | null>(props.robot);

    rx(
      props.robot$,
      subscribeUntilUnmount((user) => {
        robot$.value = user;
      })
    );

    return rx(
      robot$,
      render((robot) => {
        if (!robot) {
          return null;
        }

        return (
          <ListItem
            $heading={
              <Box sx={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{robot.name}</span>
              </Box>
            }
            $supporting={<span>{robot.updatedAt}</span>}
            $trailing={
              <GroupRobotTokenRefreshBtn
                groupName={props.groupName}
                robotID={robot.accountID}
              />
            }
          />
        );
      })
    );
  }
);

export const GroupRobotList = component$(({}, { render }) => {
  const group$ = GroupProvider.use();
  const list$ = useRequest(listGroupRobot);

  const fetch = () =>
    list$.next({
      groupName: group$.value.name,
      size: -1
    });

  onMounted(() => {
    fetch();
  });

  const listEl = rx(
    list$,
    render((resp) => {
      return resp?.body?.data.map((robot) => {
        return (
          <GroupRobotListItem
            key={robot.accountID}
            robot={robot}
            groupName={group$.value.name}
          />
        );
      });
    })
  );

  return () => (
    <Container
      $action={
        <GroupRobotAddBtn
          groupName={group$.value.name}
          onDidAdd={() => {
            fetch();
          }}
        />
      }
    >
      {listEl}
    </Container>
  );
});

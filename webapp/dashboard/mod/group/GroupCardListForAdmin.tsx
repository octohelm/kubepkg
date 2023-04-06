import {
  useRequest,
  rx,
  component$,
  onMounted,
  t,
  render,
  observableRef,
  subscribeUntilUnmount
} from "@nodepkg/runtime";
import { Box } from "@nodepkg/ui";
import {
  type Group,
  GroupType,
  listGroup
} from "@webapp/dashboard/client/dashboard";
import { GroupCard } from "./GroupCard";
import { Container } from "@webapp/dashboard/layout";
import { GroupAddBtn, GroupDeleteBtn, GroupEditBtn } from "@webapp/dashboard/mod/group/actions";

const GroupCardWithActions = component$(
  {
    group: t.custom<Group>()
  },
  (props) => {
    const group$ = observableRef<Group | null>(props.group);

    rx(
      props.group$,
      subscribeUntilUnmount((c) => (group$.value = c))
    );

    return rx(
      group$,
      render((group) => {
        if (!group) {
          return null;
        }

        return (
          <GroupCard
            group={group}
            $action={
              <>
                <GroupEditBtn
                  group={group}
                  onDidUpdate={(updatedGroup) => {
                    group$.value = updatedGroup;
                  }}
                />
                <GroupDeleteBtn
                  groupName={group.name}
                  onDidDelete={() => {
                    group$.value = null;
                  }}
                />
              </>
            }
          />
        );
      })
    );
  }
);

export const GroupCardListForAdmin = component$((_, { render }) => {
  const listGroup$ = useRequest(listGroup);

  const load = () => {
    listGroup$.next();
  };

  onMounted(load);

  return rx(
    listGroup$,
    render((resp) => {
      if (!resp) {
        return null;
      }

      return (
        <Container $action={<GroupAddBtn onDidAdd={load} />}>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 48, p: 24 }}
          >
            {[GroupType.DEVELOP, GroupType.DEPLOYMENT].map((groupType) => {
              return (
                <Box
                  key={groupType}
                  sx={{ display: "flex", flexWrap: "wrap", gap: 16 }}
                >
                  {resp.body
                    ?.filter((group) => group.type == groupType)
                    .map((group) => {
                      return (
                        <GroupCardWithActions
                          group={group}
                          key={group.groupID}
                        />
                      );
                    })}
                </Box>
              );
            })}
          </Box>
        </Container>
      );
    })
  );
});

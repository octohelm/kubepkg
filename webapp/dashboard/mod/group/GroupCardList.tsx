import {
  useRequest,
  rx,
  component$,
  Fragment,
  onMounted
} from "@nodepkg/runtime";
import { Box } from "@nodepkg/ui";
import { GroupType, listGroup } from "@webapp/dashboard/client/dashboard";
import { GroupCard } from "./GroupCard";

export const GroupCardList = component$((_, { render }) => {
  const listGroup$ = useRequest(listGroup);

  onMounted(() => {
    listGroup$.next();
  });

  return rx(
    listGroup$,
    render((resp) => {
      if (!resp) {
        return null;
      }

      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 48, p: 24 }}>
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
                      <Fragment key={group.groupID}>
                        <GroupCard
                          group={group}
                        />
                      </Fragment>
                    );
                  })}
              </Box>
            );
          })}
        </Box>
      );
    })
  );
});

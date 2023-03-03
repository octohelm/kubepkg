import { useObservableState, useRequest } from "@nodepkg/runtime";
import { Fragment, useEffect } from "react";
import { GroupType, listGroup } from "../client/dashboard";
import { map } from "@innoai-tech/lodash";
import { GroupCard } from "./GroupCard";
import { Stack } from "@mui/material";

export const GroupCardList = () => {
  const listGroup$ = useRequest(listGroup);

  useEffect(() => {
    listGroup$.next();
  }, []);

  const resp = useObservableState(listGroup$);

  if (!resp) {
    return null;
  }

  return (
    <Stack direction={"column"} spacing={2}>
      {map([GroupType.DEVELOP, GroupType.DEPLOYMENT], (groupType) => {
        return (
          <Stack key={groupType} direction="row" spacing={0} sx={{ flexWrap: "wrap", gap: 2 }}>
            {resp.body?.filter((group) => group.type == groupType).map((group) => {
              return (
                <Fragment key={group.groupID}>
                  <GroupCard group={group} />
                </Fragment>
              );
            })}
          </Stack>
        );
      })}
    </Stack>
  );
};

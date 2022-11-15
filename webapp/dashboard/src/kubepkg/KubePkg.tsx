import { useObservable } from "@innoai-tech/reactutil";
import { Box, List, ListItem, ListItemText } from "@mui/material";
import { Fragment, useEffect } from "react";
import { Scaffold } from "../layout";
import { GroupKubePkgProvider } from "./domain";
import type { Kubepkg } from "../client/dashboard";
import { Link } from "react-router-dom";

const GroupKubepkgListItem = ({ kubepkg }: { kubepkg: Kubepkg }) => {
  return (
    <>
      <ListItem>
        <ListItemText
          primary={
            <Box sx={{ fontFamily: "monospace", a: { color: "inherit" } }}>
              <Link to={`/groups/${kubepkg.group}/kubepkgs/${kubepkg.name}`}>
                {`${kubepkg.name}`}
              </Link>
            </Box>
          }
        />
      </ListItem>
    </>
  );
};

const GroupKubepkgList = () => {
  const kubepkgs$ = GroupKubePkgProvider.use$();

  useEffect(() => {
    kubepkgs$.list$.next({
      groupName: kubepkgs$.groupName,
      size: -1,
    });
  }, []);

  const list = useObservable(kubepkgs$);

  return (
    <List>
      {list?.map((kubepkg) => {
        return (
          <Fragment key={kubepkg.kubepkgID}>
            <GroupKubepkgListItem kubepkg={kubepkg} />
          </Fragment>
        );
      })}
    </List>
  );
};

export const KubePkgMain = () => {
  return (
    <GroupKubePkgProvider>
      <Scaffold>
        <GroupKubepkgList />
      </Scaffold>
    </GroupKubePkgProvider>
  );
};

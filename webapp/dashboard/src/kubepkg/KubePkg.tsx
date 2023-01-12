import {
  Subscribe,
  useObservableState,
  useStateSubject,
} from "@innoai-tech/reactutil";
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Fragment } from "react";
import { Scaffold, useEpics } from "../layout";
import { GroupKubePkgProvider } from "./domain";
import type { Kubepkg } from "../client/dashboard";
import { Link } from "react-router-dom";
import { Search, SearchIcon, SearchInput } from "../layout/SearchInput";
import { SearchOutlined } from "@mui/icons-material";
import { ignoreElements, tap } from "rxjs";

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
  const kubepkg$ = GroupKubePkgProvider.use$();

  const list = useObservableState(kubepkg$);

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

const KubePkgSearch = () => {
  const inputValue$ = useStateSubject("");

  const kubepkg$ = GroupKubePkgProvider.use$();

  useEpics(inputValue$, (_) =>
    inputValue$.pipe(
      tap((input) => {
        kubepkg$.list$.next({
          groupName: kubepkg$.groupName,
          name: input.length > 0 ? [input] : [],
          size: -1,
        });
      }),
      ignoreElements()
    )
  );

  return (
    <Search>
      <SearchIcon>
        <SearchOutlined />
      </SearchIcon>
      <Subscribe value$={inputValue$}>
        {(value) => (
          <SearchInput
            placeholder={"请输入 KubePkg 名称查询"}
            value={value}
            sx={{ flex: 1 }}
            onInput={(evt) => {
              inputValue$.next(
                (evt.target as HTMLInputElement).value?.trim() || ""
              );
            }}
          />
        )}
      </Subscribe>
      <Subscribe value$={kubepkg$.list$.requesting$}>
        {(requesting) =>
          requesting ? (
            <SearchIcon>
              <CircularProgress color="inherit" size={18} />
            </SearchIcon>
          ) : null
        }
      </Subscribe>
    </Search>
  );
};

export const KubePkgMain = () => {
  return (
    <GroupKubePkgProvider>
      <Scaffold action={<KubePkgSearch />}>
        <GroupKubepkgList />
      </Scaffold>
    </GroupKubePkgProvider>
  );
};

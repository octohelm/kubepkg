import {
  useStateSubject,
  useObservableEffect,
  useRequest,
  Subscribe
} from "@nodepkg/state";
import {
  Popover,
  CircularProgress,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Select
} from "@mui/material";
import { filter, map as rxMap, tap, debounceTime, merge } from "rxjs";
import { Add } from "@mui/icons-material";
import {
  Group,
  GroupType,
  Kubepkg,
  listGroup,
  listKubepkg
} from "../client/dashboard";
import { useProxy } from "../layout";
import { useEffect, useRef } from "react";
import { Search, SearchIcon, SearchInput } from "../layout/SearchInput";
import { map } from "@innoai-tech/lodash";

export const useKubePkgAutocomplete = ({
                                         placeholder = "请输入 KubePkg 名称查询",
                                         groupName
                                       }: {
  placeholder?: string;
  groupName?: string;
}) => {
  const selected$ = useStateSubject({
    groupName: groupName || "",
    kubePkgName: ""
  });
  const inputValue$ = useStateSubject("");
  const popper$ = useStateSubject(false);

  const listGroup$ = useRequest(listGroup);
  const listKubepkg$ = useRequest(listKubepkg);

  const groupList$ = useStateSubject([] as Group[]);
  const kubepkgList$ = useStateSubject([] as Kubepkg[]);

  useObservableEffect(() =>
    merge(
      listGroup$.pipe(
        rxMap((resp) =>
          (resp.body || []).filter((g) => g.type == GroupType.DEVELOP)
        ),
        tap((list) => groupList$.next(list))
      ),
      inputValue$.pipe(
        filter((inputValue) => inputValue.length >= 2),
        debounceTime(300),
        tap((inputValue) =>
          listKubepkg$.next({
            groupName: selected$.value.groupName,
            name: [inputValue]
          })
        ),
        tap(() => kubepkgList$.next([]))
      ),
      listKubepkg$.pipe(
        rxMap((resp) => resp.body || []),
        tap((list) => kubepkgList$.next(list)),
        tap(() => popper$.next(true))
      )
    )
  );

  useEffect(() => {
    listGroup$.next();
  }, []);

  const anchorElRef = useRef<HTMLLabelElement>(null);
  const inputElRef = useRef<HTMLInputElement>(null);

  return useProxy(selected$, {
    popper$: popper$,
    render: () => {
      return (
        <Search ref={anchorElRef}>
          <Subscribe value$={selected$}>
            {(selected) => (
              <Subscribe value$={groupList$}>
                {(groups) => (
                  <Select
                    value={selected.groupName}
                    input={<SearchInput />}
                    onChange={(evt) => {
                      selected$.next({
                        groupName: evt.target.value,
                        kubePkgName: ""
                      });
                    }}
                  >
                    {map(groups, (g) => (
                      <MenuItem key={g.groupID} value={g.name}>
                        {g.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </Subscribe>
            )}
          </Subscribe>
          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            sx={{ mx: 2 }}
          />
          <Subscribe value$={selected$}>
            {(selected) => (
              <Subscribe value$={inputValue$}>
                {(value) => (
                  <SearchInput
                    sx={{ flex: 1 }}
                    value={value}
                    ref={inputElRef}
                    placeholder={selected.kubePkgName || placeholder || ""}
                    onInput={(evt) => {
                      inputValue$.next(
                        (evt.target as HTMLInputElement).value?.trim()
                      );
                    }}
                  />
                )}
              </Subscribe>
            )}
          </Subscribe>
          <Subscribe value$={listKubepkg$.requesting$}>
            {(requesting) =>
              requesting ? (
                <SearchIcon>
                  <CircularProgress color="inherit" size={18} />
                </SearchIcon>
              ) : null
            }
          </Subscribe>
          <Subscribe value$={popper$}>
            {(show) => {
              return (
                <Popover
                  open={show}
                  anchorEl={anchorElRef.current}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                  }}
                  onClose={() => {
                    popper$.next(false);
                    inputValue$.next("");
                    inputElRef.current?.focus();
                  }}
                >
                  <MenuList
                    style={{
                      width: anchorElRef.current?.getBoundingClientRect().width
                    }}
                  >
                    <Subscribe value$={kubepkgList$}>
                      {(options) => (
                        <>
                          {options.length === 0 ? (
                            <MenuItem>{"没有找到 KubePkg"}</MenuItem>
                          ) : (
                            options.map((kubepkg) => (
                              <MenuItem
                                key={kubepkg.kubepkgID}
                                onClick={() => {
                                  selected$.next({
                                    groupName: kubepkg.group,
                                    kubePkgName: kubepkg.name
                                  });
                                  inputValue$.next("");
                                }}
                              >
                                <ListItemIcon>
                                  <Add fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>
                                  {`${kubepkg.group}/${kubepkg.name}`}
                                </ListItemText>
                              </MenuItem>
                            ))
                          )}
                        </>
                      )}
                    </Subscribe>
                  </MenuList>
                </Popover>
              );
            }}
          </Subscribe>
        </Search>
      );
    }
  });
};

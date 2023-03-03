import { useStateSubject, useRequest, Subscribe } from "@nodepkg/runtime";
import {
  Popover,
  CircularProgress,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { filter, map, tap, debounceTime } from "rxjs";
import { Search as SearchIconOutlined, Add } from "@mui/icons-material";
import { AccountUser, listAccount } from "../client/dashboard";
import { useEpics, useProxy } from "../layout";
import { useRef } from "react";
import { Search, SearchIcon, SearchInput } from "../layout/SearchInput";

export const useAccountAutocomplete = ({
  placeholder,
}: {
  placeholder?: string;
}) => {
  const selected$ = useStateSubject("");
  const inputValue$ = useStateSubject("");
  const popper$ = useStateSubject(false);
  const listAccount$ = useRequest(listAccount);
  const options$ = useStateSubject([] as AccountUser[]);

  useEpics(
    options$,
    () =>
      listAccount$.pipe(
        map((resp) => resp.body.data || []),
        tap(() => popper$.next(true))
      ),
    () =>
      inputValue$.pipe(
        filter((inputValue) => inputValue.length >= 3),
        debounceTime(300),
        tap((inputValue) => listAccount$.next({ identity: [inputValue] })),
        map(() => [])
      )
  );

  const anchorElRef = useRef<HTMLLabelElement>(null);
  const inputElRef = useRef<HTMLInputElement>(null);

  return useProxy(selected$, {
    popper$: popper$,
    render: () => {
      return (
        <Search ref={anchorElRef}>
          <SearchIcon>
            <SearchIconOutlined />
          </SearchIcon>
          <Subscribe value$={inputValue$}>
            {(value) => (
              <SearchInput
                value={value}
                sx={{ flex: 1 }}
                ref={inputElRef}
                placeholder={placeholder || ""}
                onInput={(evt) => {
                  inputValue$.next(
                    (evt.target as HTMLInputElement).value?.trim()
                  );
                }}
              />
            )}
          </Subscribe>
          <Subscribe value$={listAccount$.requesting$}>
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
                    horizontal: "left",
                  }}
                  onClose={() => {
                    popper$.next(false);
                    inputValue$.next("");
                    inputElRef.current?.focus();
                  }}
                >
                  <MenuList
                    style={{
                      width: anchorElRef.current?.getBoundingClientRect().width,
                    }}
                  >
                    <Subscribe value$={options$}>
                      {(options) => (
                        <>
                          {options.length === 0 ? (
                            <MenuItem>{"没有找到用户"}</MenuItem>
                          ) : (
                            options.map((user) => (
                              <MenuItem
                                key={user.accountID}
                                onClick={() => {
                                  selected$.next(user.accountID);
                                  inputValue$.next("");
                                }}
                              >
                                <ListItemIcon>
                                  <Add fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>
                                  {`${user.nickname}（${user.email}）`}
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
    },
  });
};

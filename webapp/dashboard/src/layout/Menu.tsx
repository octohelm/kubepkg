import {
  StateSubject,
  useStateSubject
} from "@nodepkg/state";
import {
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  useTheme
} from "@mui/material";
import { useRef } from "react";
import { map, Observable } from "rxjs";
import { useProxy } from "@nodepkg/state";

export const useMenu = (
  {
    content
  }: {
    content: (open: boolean) => JSX.Element;
  },
  ...epics: Array<(subject$: StateSubject<boolean>) => Observable<boolean>>
) => {
  const anchorRef = useRef(null);
  const menu$ = useStateSubject(false);
  const theme = useTheme();

  return useProxy(
    menu$,
    {
      anchorRef: anchorRef,
      elements$: menu$.pipe(map((open) => (
        <Popper
          open={open}
          transition
          anchorEl={anchorRef.current}
          sx={{ zIndex: theme.zIndex.tooltip }}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom-start" ? "left top" : "left bottom"
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={() => menu$.next(false)}>
                  {content(open)}
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      )))
    },
    ...epics
  );
};

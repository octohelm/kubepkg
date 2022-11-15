import { StateSubject, Subscribe, useStateSubject } from "@innoai-tech/reactutil";
import { ClickAwayListener, Grow, Paper, Popper, useTheme } from "@mui/material";
import { useRef } from "react";
import type { Observable } from "rxjs";
import { useProxy } from "./state";

export const useMenu = ({ content }: {
  content: (open: boolean) => JSX.Element;
}, ...epics: Array<(subject$: StateSubject<boolean>) => Observable<boolean>>) => {
  const anchorRef = useRef(null);
  const menu$ = useStateSubject(false);
  const theme = useTheme()

  return useProxy(
    menu$,
    {
      anchorRef: anchorRef,
      render: () => (
        <Subscribe value$={menu$}>
          {(open) => (
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
          )}
        </Subscribe>
      )
    },
    ...epics
  );
};
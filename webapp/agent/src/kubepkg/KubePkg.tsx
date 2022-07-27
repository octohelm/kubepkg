import { KubepkgV1Alpha1KubePkg, listKubePkg } from "../client/agent";
import {
  Subscribe,
  useObservableEffect,
  useRequest,
  useStateSubject,
} from "@innoai-tech/reactutil";
import { useMemo } from "react";
import { tap } from "rxjs/operators";
import { interval, merge } from "rxjs";
import { Grid, IconButton, Paper, Stack, useMediaQuery } from "@mui/material";
import { Sync } from "@mui/icons-material";
import { Box } from "@mui/system";
import { map } from "@innoai-tech/lodash";
import { KubePkgCard } from "./KubePkgCard";

export const KubePkgQuerier = () => {
  const listKubePkg$ = useRequest(listKubePkg);

  const list$ = useStateSubject<KubepkgV1Alpha1KubePkg[]>([]);

  const fetch = useMemo(() => {
    return () => {
      listKubePkg$.next(undefined);
    };
  }, []);

  useObservableEffect(() => {
    fetch();
    return interval(5 * 1000).pipe(tap(() => fetch()));
  }, []);

  useObservableEffect(() => {
    return merge(listKubePkg$.pipe(tap((resp) => list$.next(resp.body))));
  }, []);

  const size = 512;
  const minWidthMatched = useMediaQuery(`(min-width:${size * 2}px)`);

  return (
    <Stack gap={3} sx={{ width: "100%", height: "100%" }}>
      <Paper sx={{ maxWidth: 1200 }}>
        <Stack
          direction={"row"}
          gap={0.5}
          sx={{
            alignItems: "center",
            padding: 0.5,
            borderRadius: 2,
          }}
        >
          <Subscribe value$={listKubePkg$.requesting$}>
            {(requesting) => (
              <IconButton disabled={requesting} onClick={() => fetch()}>
                <Sync />
              </IconButton>
            )}
          </Subscribe>
        </Stack>
      </Paper>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <Grid container={true} gap={2}>
          <Subscribe value$={list$}>
            {(list) => (
              <>
                {map(list, (b) => {
                  return (
                    <Box
                      key={`${b.metadata?.name}.${b.metadata?.namespace}`}
                      sx={{
                        width: minWidthMatched ? size : "100%",
                      }}
                    >
                      <KubePkgCard kubepkg={b} />
                    </Box>
                  );
                })}
              </>
            )}
          </Subscribe>
        </Grid>
      </Box>
    </Stack>
  );
};

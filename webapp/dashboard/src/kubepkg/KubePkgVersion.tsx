import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  MenuList,
  Stack,
  Tab,
  Tabs
} from "@mui/material";
import {
  Subscribe,
  useStateSubject,
  useObservableEffect,
  useRequest,
  StateSubject
} from "@innoai-tech/reactutil";
import { stringifySearch, parseSearch } from "@innoai-tech/fetcher";
import { get, map, values } from "@innoai-tech/lodash";
import { map as rxMap, tap } from "rxjs";

import {
  ApisKubepkgV1Alpha1KubePkg,
  KubepkgChannel,
  KubepkgVersionInfo,
  putKubepkgVersion
} from "../client/dashboard";
import { AccessControl } from "../auth";
import { RxFragment, Scaffold, useDialog, useEpics, useMenu, useProxy } from "../layout";
import { GroupKubePkgVersionProvider } from "./domain";
import { KubePkgEditor } from "./KubePkgEditor";
import { useEffect } from "react";
import { MoreHoriz } from "@mui/icons-material";

export const KubepkgVersionView = ({
                                     versionInfo,
                                     channel
                                   }: {
  versionInfo: KubepkgVersionInfo;
  channel: KubepkgChannel;
}) => {
  const kubepkgVersion$ = GroupKubePkgVersionProvider.use$();

  const kubepkg$ = useStateSubject({} as ApisKubepkgV1Alpha1KubePkg);

  useEpics(kubepkg$, () =>
    kubepkgVersion$.get$.pipe(rxMap((resp) => resp.body))
  );

  useEffect(() => {
    kubepkgVersion$.get$.next({
      groupName: kubepkgVersion$.groupName,
      name: kubepkgVersion$.kubePkgName,
      channel: channel,
      revisionID: versionInfo.revisionID
    });
  }, []);

  return <KubePkgEditor kubepkg$={kubepkg$} />;
};

export const useKubepkgVersionView = (
  versionInfo: KubepkgVersionInfo,
  channel: KubepkgChannel
) => {
  return useDialog({
    title: `KubePkg ${versionInfo.version}`,
    sx: { "& .MuiDialog-paper": { maxWidth: "90vw", width: "90vw" } },
    content: <KubepkgVersionView versionInfo={versionInfo} channel={channel} />
  });
};

export const useKubeVersionChannel = (
  versionInfo: KubepkgVersionInfo,
  channel: KubepkgChannel
) => {
  const kubepkgVersion$ = GroupKubePkgVersionProvider.use$();
  const put$ = useRequest(putKubepkgVersion);
  const channelIdx = values(KubepkgChannel).indexOf(channel);

  const dialog$ = useDialog(
    {
      title: "发布版本到...",
      sx: { "& .MuiDialog-paper": { width: "40vw" } },
      content: (
        <MenuList>
          {map(values(KubepkgChannel), (c, i) =>
            i > channelIdx ? (
              <MenuItem
                key={c}
                onClick={() => {
                  put$.next({
                    groupName: kubepkgVersion$.groupName,
                    name: kubepkgVersion$.kubePkgName,
                    channel: c,
                    body: versionInfo
                  });
                }}
              >
                <ListItemText>{c}</ListItemText>
              </MenuItem>
            ) : null
          )}
        </MenuList>
      )
    },
    () => put$.pipe(rxMap(() => false))
  );

  return useProxy(put$, {
    dialog$: dialog$
  });
};

const GroupKubeVersionListItem = ({
                                    channel,
                                    versionInfo,
                                    selectedRevision$
                                  }: {
  versionInfo: KubepkgVersionInfo;
  channel: KubepkgChannel;
  selectedRevision$?: StateSubject<string>;
}) => {
  const kubepkgVersion$ = GroupKubePkgVersionProvider.use$();

  const releaseToChannel$ = useKubeVersionChannel(versionInfo, channel);

  const kubepkgDialogView$ = useKubepkgVersionView(versionInfo, channel);

  const dialogForDelete$ = useDialog(
    {
      title: "删除版本",
      content: `是否删除版本 ${versionInfo.version}`,
      onConfirm: () => {
        kubepkgVersion$.del$.next({
          groupName: kubepkgVersion$.groupName,
          name: kubepkgVersion$.kubePkgName,
          channel,
          version: encodeURIComponent(versionInfo.version)
        });
      }
    },
    () => kubepkgVersion$.del$.pipe(rxMap(() => false))
  );

  const menu$ = useMenu({
    content: (open) => (
      <MenuList autoFocusItem={open}>
        <AccessControl op={kubepkgVersion$.del$}>
          <MenuItem
            onClick={() => {
              dialogForDelete$.next(true);
            }}
          >
            删除
          </MenuItem>
          <RxFragment>
            {dialogForDelete$.elements$}
          </RxFragment>
        </AccessControl>
        <AccessControl op={releaseToChannel$}>
          <MenuItem
            onClick={() => {
              releaseToChannel$.dialog$.next(true);
            }}
          >
            发布到
          </MenuItem>
          <RxFragment>
            {releaseToChannel$.dialog$.elements$}
          </RxFragment>
        </AccessControl>
      </MenuList>
    )
  });

  return (
    <Subscribe value$={selectedRevision$ || new StateSubject("")}>
      {(selectedRevision) => (
        <ListItem
          sx={{
            paddingLeft: 1,
            paddingRight: 1,
            paddingTop: 0.5,
            paddingBottom: 0.5
          }}
          selected={selectedRevision === versionInfo.revisionID}
        >
          <ListItemText
            sx={{ margin: "0" }}
            secondary={
              <Stack
                component={"span"}
                direction={"row"}
                sx={{ alignItems: "center", justifyContent: "space-between" }}
              >
                <>
                  <Link
                    component="button"
                    sx={{
                      fontFamily: "monospace",
                      color: "inherit",
                      textAlign: "left"
                    }}
                    onClick={(e) => {
                      e.preventDefault();

                      if (!!selectedRevision$) {
                        selectedRevision$.next(versionInfo.revisionID);
                      } else {
                        kubepkgDialogView$.next(true);
                      }
                    }}
                  >
                    {`${versionInfo.version}`}
                  </Link>
                  {!selectedRevision$ &&
                    <RxFragment>
                      {kubepkgDialogView$.elements$}
                    </RxFragment>
                  }
                </>

                <>
                  <IconButton
                    ref={menu$.anchorRef}
                    onClick={() => menu$.next(true)}
                  >
                    <MoreHoriz />
                  </IconButton>
                  {menu$.render()}
                </>
              </Stack>
            }
          />
        </ListItem>
      )}
    </Subscribe>
  );
};

export const GroupKubepkgVersionList = ({
                                          channel$,
                                          selectedRevision$
                                        }: {
  channel$: StateSubject<KubepkgChannel>;
  selectedRevision$?: StateSubject<string>;
}) => {
  const kubepkgVersion$ = GroupKubePkgVersionProvider.use$();

  useObservableEffect(() =>
    channel$.pipe(
      tap((channel) => {
        kubepkgVersion$.list$.next({
          groupName: kubepkgVersion$.groupName,
          name: kubepkgVersion$.kubePkgName,
          channel: channel
        });
      })
    ));

  return (
    <Subscribe value$={channel$}>
      {(channel) => (
        <>
          <Tabs
            value={values(KubepkgChannel).indexOf(channel)}
            onChange={(_: any, i: number) =>
              channel$.next(values(KubepkgChannel)[i]!)
            }
          >
            {map(KubepkgChannel, (c) => (
              <Tab key={c} label={c} />
            ))}
          </Tabs>
          <Subscribe value$={kubepkgVersion$}>
            {(list) => (
              <List
                sx={{
                  maxWidth: "600px",
                  height: "100%",
                  overflowY: "auto",
                  overflowX: "none"
                }}
              >
                {list?.map((versionInfo) => (
                  <GroupKubeVersionListItem
                    key={versionInfo.revisionID}
                    selectedRevision$={selectedRevision$}
                    versionInfo={versionInfo}
                    channel={channel}
                  />
                ))}
              </List>
            )}
          </Subscribe>
        </>
      )}
    </Subscribe>
  );
};

export const KubePkgVersionMain = () => {
  const params = useParams() as any;
  const location = useLocation();

  const nav = useNavigate();

  const channel$ = useStateSubject(
    () =>
      get(
        parseSearch(location.search),
        ["channel", 0],
        KubepkgChannel.DEV
      ) as KubepkgChannel
  );

  useObservableEffect(
    () =>
      channel$.pipe(
        tap((channel) => {
          nav(
            stringifySearch({
              channel: channel
            })
          );
        })
      ),
    []
  );

  return (
    <GroupKubePkgVersionProvider
      groupName={params.group}
      kubePkgName={params.name}
    >
      <Scaffold>
        <GroupKubepkgVersionList channel$={channel$} />
      </Scaffold>
    </GroupKubePkgVersionProvider>
  );
};

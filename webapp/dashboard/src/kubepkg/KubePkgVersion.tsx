import { useParams, useNavigate, useLocation } from "@nodepkg/router";
import {
  Box,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  MenuList,
  Stack,
  Tab,
  Tabs,
  Divider
} from "@mui/material";
import {
  Slot,
  Subscribe,
  useStateSubject,
  useObservableEffect,
  useAsObservable,
  useRequest,
  StateSubject,
  useMemoObservable
} from "@nodepkg/state";
import { stringifySearch, parseSearch } from "@innoai-tech/fetcher";
import { get, map, values } from "@innoai-tech/lodash";
import { combineLatest, filter, map as rxMap, merge, tap } from "rxjs";

import {
  ApisKubepkgV1Alpha1KubePkg,
  KubepkgChannel,
  KubepkgVersionInfo,
  putKubepkgVersion
} from "../client/dashboard";
import { AccessControl } from "../auth";
import { Scaffold, useDialog, useMenu, useProxy } from "../layout";
import { GroupKubePkgVersionProvider } from "./domain";
import { KubePkgEditor } from "./KubePkgEditor";
import { MoreHoriz } from "@mui/icons-material";

export const KubepkgVersionView = ({
                                     revisionID,
                                     channel
                                   }: {
  channel: KubepkgChannel;
  revisionID: string;
}) => {
  const channel$ = useAsObservable(channel);
  const revisionID$ = useAsObservable(revisionID);

  const kubepkgVersion$ = GroupKubePkgVersionProvider.use$();

  const kubepkg$ = useStateSubject({} as ApisKubepkgV1Alpha1KubePkg);

  useObservableEffect(() =>
    merge(
      kubepkgVersion$.get$.pipe(
        rxMap((resp) => resp.body),
        tap(kubepkg$.next)
      ),
      combineLatest(channel$, revisionID$).pipe(
        filter(([_, revisionID]) => !!revisionID),
        tap(([channel, revisionID]) => {
          kubepkgVersion$.get$.next({
            groupName: kubepkgVersion$.groupName,
            name: kubepkgVersion$.kubePkgName,
            channel: channel,
            revisionID: revisionID
          });
        })
      )
    )
  );

  return <KubePkgEditor kubepkg$={kubepkg$} />;
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
          <Slot elem$={dialogForDelete$.elements$} />
        </AccessControl>
        <AccessControl op={releaseToChannel$}>
          <MenuItem
            onClick={() => {
              releaseToChannel$.dialog$.next(true);
            }}
          >
            发布到
          </MenuItem>
          <Slot elem$={releaseToChannel$.dialog$.elements$} />
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
                      }
                    }}
                  >
                    {`${versionInfo.version}`}
                  </Link>
                </>
                <>
                  <IconButton
                    ref={menu$.anchorRef}
                    onClick={() => menu$.next(true)}
                  >
                    <MoreHoriz />
                  </IconButton>
                  <Slot elem$={menu$.elements$} />
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
    )
  );

  const versionListElements$ = useMemoObservable(() =>
    combineLatest(kubepkgVersion$, channel$).pipe(
      rxMap(([list, channel]) => (
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
      ))
    )
  );

  const channelSwitchElements$ = useMemoObservable(() =>
    channel$.pipe(
      rxMap((channel) => (
        <Tabs
          variant="scrollable"
          scrollButtons={false}
          value={values(KubepkgChannel).indexOf(channel)}
          onChange={(_: any, i: number) =>
            channel$.next(values(KubepkgChannel)[i]!)
          }
        >
          {map(KubepkgChannel, (c) => (
            <Tab key={c} label={c} />
          ))}
        </Tabs>
      ))
    )
  );

  return (
    <>
      <Slot elem$={channelSwitchElements$} />
      <Slot elem$={versionListElements$} />
    </>
  );
};

export const KubepkgVersionPreview = () => {
  const nav = useNavigate();
  const location = useLocation();

  const channel$ = useStateSubject(
    () =>
      get(
        parseSearch(location.search),
        ["channel", 0],
        KubepkgChannel.DEV
      ) as KubepkgChannel
  );
  const selectedRevision$ = useStateSubject(() =>
    get(parseSearch(location.search), ["revision", 0], "")
  );

  useObservableEffect(() =>
    combineLatest([channel$, selectedRevision$]).pipe(
      tap(([channel, revision]) => {
        nav(
          stringifySearch({
            channel,
            revision
          })
        );
      })
    )
  );

  const revisionView$ = useMemoObservable(() =>
    combineLatest([selectedRevision$, channel$]).pipe(
      rxMap(([revisionID, channel]) => {
        return <KubepkgVersionView revisionID={revisionID} channel={channel} />;
      })
    )
  );

  return (
    <Stack
      direction={"row"}
      spacing={2}
      sx={{ width: "100%", height: "100%", overflow: "hidden" }}
    >

      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Slot elem$={revisionView$} />
      </Box>
      <Divider orientation={"vertical"} />
      <Box sx={{ width: "30%" }}>
        <GroupKubepkgVersionList
          channel$={channel$}
          selectedRevision$={selectedRevision$}
        />
      </Box>
    </Stack>
  );
};

export const KubePkgVersionMain = () => {
  const params = useParams<{ group: string; name: string }>();

  return (
    <GroupKubePkgVersionProvider
      groupName={params.group!}
      kubePkgName={params.name!}
    >
      <Scaffold>
        <KubepkgVersionPreview />
      </Scaffold>
    </GroupKubePkgVersionProvider>
  );
};

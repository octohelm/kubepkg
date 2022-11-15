import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  MenuList,
  Stack,
  Tab,
  Tabs
} from "@mui/material";
import { Subscribe, useStateSubject, useObservableEffect, useRequest } from "@innoai-tech/reactutil";
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
import { Scaffold, useDialog, useEpics, useProxy } from "../layout";
import { GroupKubePkgVersionProvider } from "./domain";
import { KubePkgEditor } from "./KubePkgEditor";
import { useEffect } from "react";

export const KubepkgVersionView = ({
                                     versionInfo,
                                     channel
                                   }: {
  versionInfo: KubepkgVersionInfo,
  channel: KubepkgChannel
}) => {
  const kubepkgs$ = GroupKubePkgVersionProvider.use$();

  const kubepkg$ = useStateSubject({} as ApisKubepkgV1Alpha1KubePkg);

  useEpics(kubepkg$, () => kubepkgs$.get$.pipe(rxMap((resp) => resp.body)));

  useEffect(() => {
    kubepkgs$.get$.next({
      groupName: kubepkgs$.groupName,
      name: kubepkgs$.name,
      channel: channel,
      revisionID: versionInfo.revisionID
    });
  }, []);

  return <KubePkgEditor kubepkg$={kubepkg$} />;
};

export const useKubepkgVersionView = (versionInfo: KubepkgVersionInfo, channel: KubepkgChannel) => {
  return useDialog({
    title: `KubePkg ${versionInfo.version}`,
    sx: { "& .MuiDialog-paper": { maxWidth: "80vw", width: "80vw" } },
    content: (
      <KubepkgVersionView
        versionInfo={versionInfo}
        channel={channel}
      />
    )
  });
};

export const useKubeVersionChannel = (versionInfo: KubepkgVersionInfo, channel: KubepkgChannel) => {
  const kubepkgs$ = GroupKubePkgVersionProvider.use$();
  const put$ = useRequest(putKubepkgVersion);
  const channelIdx = values(KubepkgChannel).indexOf(channel);

  const dialog$ = useDialog({
      title: "发布版本到...",
      content: (
        <MenuList>
          {map(values(KubepkgChannel), (c, i) => i > channelIdx ?
            <MenuItem
              key={c}
              onClick={() => {
                put$.next({
                  groupName: kubepkgs$.groupName,
                  name: kubepkgs$.name,
                  channel: c,
                  body: versionInfo
                });
              }}
            >
              <ListItemText>
                {c}
              </ListItemText>
            </MenuItem>
            : null)}
        </MenuList>
      )
    },
    () => put$.pipe(rxMap(() => false))
  );

  return useProxy(
    put$,
    {
      dialog$: dialog$
    }
  );
};

const GroupKubeVersionListItem = ({
                                    channel,
                                    versionInfo
                                  }: { versionInfo: KubepkgVersionInfo, channel: KubepkgChannel }) => {
  const kubepkgs$ = GroupKubePkgVersionProvider.use$();

  const kvChannel$ = useKubeVersionChannel(versionInfo, channel);

  const kubepkgView$ = useKubepkgVersionView(versionInfo, channel);

  const dialogForDelete$ = useDialog({
      title: "删除版本",
      content: `是否删除版本 ${versionInfo.version}`,
      onConfirm: () => {
        kubepkgs$.del$.next({
          groupName: kubepkgs$.groupName,
          name: kubepkgs$.name,
          channel,
          version: encodeURIComponent(versionInfo.version)
        });
      }
    },
    () => kubepkgs$.del$.pipe(rxMap(() => false))
  );

  return (
    <ListItem sx={{ paddingLeft: 1, paddingRight: 1, paddingTop: 0, paddingBottom: 0 }}>
      <ListItemText
        sx={{ margin: "0" }}
        secondary={
          <Stack component={"span"} direction={"row"} spacing={1} sx={{ alignItems: "center" }}>
            <Box component={"span"} sx={{ fontFamily: "monospace", "a": { color: "inherit" } }}>
              {`${versionInfo.version}`}
            </Box>
            <ButtonGroup component={"span"}>
              <Button
                variant="text"
                onClick={() => {
                  kubepkgView$.next(true);
                }}
              >
                详情
              </Button>
              {kubepkgView$.render()}
              <AccessControl op={kubepkgs$.del$}>
                <Button
                  variant="text"
                  onClick={() => {
                    dialogForDelete$.next(true);
                  }}
                >
                  删除
                </Button>
                {dialogForDelete$.render()}
              </AccessControl>
              <AccessControl op={kvChannel$}>
                <Button
                  variant="text"
                  onClick={() => {
                    kvChannel$.dialog$.next(true);
                  }}
                >
                  发布到...
                </Button>
                {kvChannel$.dialog$.render()}
              </AccessControl>
            </ButtonGroup>
          </Stack>
        }
      />
    </ListItem>
  );
};

const GroupKubepkgVersionList = () => {
  const kubepkgs$ = GroupKubePkgVersionProvider.use$();
  const nav = useNavigate();
  const location = useLocation();

  const channel$ = useStateSubject(() => get(parseSearch(location.search), ["channel", 0], KubepkgChannel.DEV) as KubepkgChannel);

  useObservableEffect(() =>
    channel$.pipe(
      tap((channel) => {
        nav(stringifySearch({
          channel: channel
        }));
      }),
      tap((channel) => {
        kubepkgs$.list$.next({
          groupName: kubepkgs$.groupName,
          name: kubepkgs$.name,
          channel: channel
        });
      })), []
  );

  return (
    <Subscribe value$={channel$}>
      {(channel) => (
        <>
          <Tabs
            value={values(KubepkgChannel).indexOf(channel)}
            onChange={(_: any, i: number) => channel$.next(values(KubepkgChannel)[i]!)}
          >
            {map(KubepkgChannel, (c) => (
              <Tab key={c} label={c} />
            ))}
          </Tabs>
          <Subscribe value$={kubepkgs$}>
            {(list) => (
              <List>
                {list?.map((versionInfo) => (
                  <GroupKubeVersionListItem key={versionInfo.revisionID} versionInfo={versionInfo} channel={channel} />
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

  return (
    <GroupKubePkgVersionProvider groupName={params.group} name={params.name}>
      <Scaffold>
        <GroupKubepkgVersionList />
      </Scaffold>
    </GroupKubePkgVersionProvider>
  );
};

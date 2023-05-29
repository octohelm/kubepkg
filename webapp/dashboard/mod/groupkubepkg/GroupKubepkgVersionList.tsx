import {
  t,
  render,
  component,
  component$,
  rx,
  ref,
  useRequest,
  observableRef,
  subscribeUntilUnmount,
  subscribeOnMountedUntilUnmount,
  type VNodeChild
} from "@nodepkg/runtime";
// @ts-ignore
import semver from "semver";
import { styled, Box, Icon, mdiChevronUp, mdiChevronDown } from "@nodepkg/ui";
import {
  type KubepkgVersionInfo,
  KubepkgChannel,
  listKubepkgVersion
} from "@webapp/dashboard/client/dashboard";
import { Container } from "@webapp/dashboard/layout";
import { map, groupBy } from "@nodepkg/runtime/lodash";
import { GroupProvider } from "@webapp/dashboard/mod/group";
import { combineLatest, map as rxMap } from "@nodepkg/runtime/rxjs";
import {
  GroupKubepkgDeleteBtn,
  GroupKubepkgVersionPublishBtn
} from "@webapp/dashboard/mod/groupkubepkg/actions";
import { GroupKubepkgChannelSwitch } from "./GroupKubepkgChannelSwitch";
import { getBaseVersion } from "./helpers";


export const GroupKubepkgVersionListGroup = component(
  {
    groupName: t.string(),
    kubepkgName: t.string(),
    channel: t.nativeEnum(KubepkgChannel),
    base: t.string(),
    kubepkgVersions: t.custom<KubepkgVersionInfo[]>(),
    onVersionUpdated:
      t.custom<(event: "update" | "delete", v: KubepkgVersionInfo) => void>()
  },
  (props, { emit }) => {
    return () => (
      <Expandable
        $heading={
          <Box sx={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StyledVersion sx={{ flex: 1 }}>
              {props.kubepkgVersions[0]?.version}
            </StyledVersion>
            <Chip>{props.base}</Chip>
          </Box>
        }
      >
        {map(props.kubepkgVersions, (k) => (
          <Row>
            <StyledVersion sx={{ flex: 1 }}>{k.version}</StyledVersion>
            <div data-role="action">
              <GroupKubepkgVersionPublishBtn
                groupName={props.groupName}
                kubepkgName={props.kubepkgName}
                fromChannel={props.channel}
                versionInfo={k}
              />
              <GroupKubepkgDeleteBtn
                groupName={props.groupName}
                kubepkgName={props.kubepkgName}
                channel={props.channel}
                version={k.version}
                onDidDelete={() => emit("version-updated", "delete", k)}
              />
            </div>
          </Row>
        ))}
      </Expandable>
    );
  }
);

const Row = styled("div")({
  display: "flex",
  alignItems: "center",
  py: 4,

  $data_role__action: {
    mr: -8,
    display: "flex",
    alignItems: "center"
  }
});

const Expandable = styled(
  "div",
  {
    $heading: t.custom<VNodeChild>(),
    $default: t.custom<VNodeChild>()
  },
  ({}, { slots }) => {
    const expandable = ref(false);

    return (Wrap) => (
      <Wrap data-expandable={expandable.value}>
        <div
          data-role={"heading"}
          onClick={() => (expandable.value = !expandable.value)}
        >
          <div data-role={"heading-content"}>{slots.heading?.()}</div>
          <Icon path={expandable.value ? mdiChevronUp : mdiChevronDown} />
        </div>
        {expandable.value && (
          <div data-role={"content"}>{slots.default?.()} </div>
        )}
      </Wrap>
    );
  }
)({
  _expandable: {
    shadow: "1",
    rounded: "sm",
    m: 16,
    pb: 16
  },

  $data_role__heading: {
    userSelect: "none",
    cursor: "pointer",
    minH: 60,
    px: 24,
    py: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
    $data_role__heading_content: {
      flex: 1
    }
  },
  $data_role__content: {
    maxHeight: 200,
    overflow: "auto",
    containerStyle: "sys.surface-container-low",
    mx: 16,
    px: 24,
    py: 16,
    rounded: "sm"
  }
});

const StyledVersion = styled("div")({
  textStyle: "sys.body-medium",
  lineHeight: "2",
  font: "code",
  textAlign: "left"
});

const Chip = styled("span")({
  px: 10,
  h: 18,
  rounded: 18,
  textStyle: "sys.body-small",
  containerStyle: "sys.primary-container",
  display: "inline-flex",
  alignItems: "center"
});

const trimV = (v: string) => {
  if (v.startsWith("v")) {
    return v.slice(1);
  }
  return v;
};

const compare = (a: string, b: string) => {
  return semver.gt(trimV(a), trimV(b)) ? -1 : 1;
};

export const orderVersions = (versions: string[]) => {
  return versions.sort(compare);
};

export const GroupKubepkgVersionList = component$(
  {
    kubepkgName: t.string()
  },
  (props, {}) => {
    const group$ = GroupProvider.use();
    const list$ = useRequest(listKubepkgVersion);

    const filters$ = observableRef({
      channel: KubepkgChannel.DEV,
      input: ""
    });

    rx(
      filters$,
      subscribeOnMountedUntilUnmount((filters) => {
        list$.next({
          groupName: group$.value.name,
          name: props.kubepkgName,
          channel: filters.channel
        });
      })
    );

    const versionSubject$ = observableRef<{
      versions: KubepkgVersionInfo[];
    }>({
      versions: []
    });

    rx(
      list$,
      rxMap((resp) => ({
        versions: resp.body
      })),
      subscribeUntilUnmount(versionSubject$.next)
    );

    const listEl = rx(
      combineLatest([versionSubject$, filters$]),
      rxMap(([version, filters]) => {
        if (filters.input) {
          return version.versions.filter((v) =>
            v.version.includes(filters.input)
          );
        }
        return version.versions;
      }),
      render((versions) => {
        const grouped = groupBy(versions, (k) => getBaseVersion(k.version));
        const keys = orderVersions(Object.keys(grouped));

        return (
          <>
            {map(keys, (base) => {
              const kubepkgVersions = grouped[base]!;

              return (
                <GroupKubepkgVersionListGroup
                  key={base}
                  groupName={group$.value.name}
                  kubepkgName={props.kubepkgName}
                  channel={filters$.value.channel}
                  base={base}
                  kubepkgVersions={kubepkgVersions}
                  onVersionUpdated={(action, v) => {
                    if (action == "delete") {
                      versionSubject$.next((version) => {
                        version.versions = version.versions.filter(
                          (kv) => kv.version !== v.version
                        );
                      });
                    }
                  }}
                />
              );
            })}
          </>
        );
      })
    );

    const channelEl = rx(
      filters$,
      render((filters) => (
        <GroupKubepkgChannelSwitch
          value={filters.channel}
          onValueChange={(c) =>
            (filters$.value = {
              channel: c,
              input: ""
            })
          }
        />
      ))
    );

    return () => (
      <Container
        $toolbar={channelEl}
        $action={
          <FilterInput
            placeholder={"输入并筛选"}
            onInput={(e) =>
              filters$.next((f) => {
                f.input = (e.target as HTMLInputElement).value;
              })
            }
          />
        }
      >
        {listEl}
      </Container>
    );
  }
);

export const FilterInput = styled("input")({
  py: 6,
  px: 16,
  rounded: 16,

  textStyle: "sys.body-small",
  border: "none",
  outline: "none",
  containerStyle: "sys.surface-container"
});

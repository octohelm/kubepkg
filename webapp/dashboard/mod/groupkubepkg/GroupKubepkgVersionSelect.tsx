import {
  component$,
  useRequest,
  rx,
  subscribeOnMountedUntilUnmount,
  t,
  render,
  observableRef,
  type VNodeChild
} from "@nodepkg/runtime";
import { styled, Box } from "@nodepkg/ui";
import {
  KubepkgChannel,
  listKubepkgVersion,
  type KubepkgVersionInfo,
  type KubepkgRevisionId
} from "@webapp/dashboard/client/dashboard";
import { combineLatest, map as rxMap } from "@nodepkg/runtime/rxjs";
import { getBaseVersion } from "@webapp/dashboard/mod/groupkubepkg/helpers";
import { groupBy, map } from "@nodepkg/runtime/lodash";

export const GroupKubepkgVersionSelect = component$(
  {
    groupName: t.string(),
    kubepkgName: t.string(),
    channel: t.nativeEnum(KubepkgChannel),
    revisionID: t.string().optional(),
    onSelected: t.custom<(revisionID: KubepkgRevisionId) => void>()
  },
  (props, { emit }) => {
    const listKubepkgVersion$ = useRequest(listKubepkgVersion);

    const filters$ = rx(
      combineLatest([props.groupName$, props.kubepkgName$, props.channel$]),
      rxMap(([groupName, kubepkgName, channel]) => {
        return {
          groupName,
          kubepkgName,
          channel
        };
      })
    );

    rx(
      filters$,
      subscribeOnMountedUntilUnmount((filters) => {
        listKubepkgVersion$.next({
          groupName: filters.groupName,
          name: filters.kubepkgName,
          channel: filters.channel
        });
      })
    );

    return rx(
      listKubepkgVersion$,
      rxMap((resp) => resp.body),
      render((versions) => {
        const grouped = groupBy(versions, (k) => getBaseVersion(k.version));

        return (
          <Box sx={{ py: 8 }}>
            {map(grouped, (versions, base) => {
              const focused = !!versions.find((v) => v.revisionID == props.revisionID);

              return (
                <VersionExpandable
                  expanded={focused}
                  $heading={<VersionGroup>{base}</VersionGroup>}
                >
                  <VersionList
                    base={base}
                    revisionID={props.revisionID}
                    versions={versions}
                    onSelected={(version) => {
                      emit("selected", version);
                    }}
                  />
                </VersionExpandable>
              );
            })}
          </Box>
        );
      })
    );
  }
);

const VersionGroup = styled("div")({
  textStyle: "sys.label-medium",
  font: "code",
  color: "sys.primary",
  px: 8,
  py: 8
});

const VersionList = styled(
  "div",
  {
    revisionID: t.string().optional(),
    onSelected: t.custom<(revision: string) => void>(),

    base: t.string(),
    versions: t.array(t.custom<KubepkgVersionInfo>())
  },
  (props, { emit }) => {
    return (Wrap) => (
      <Wrap>
        {map(props.versions, (v) => {
          return (
            <span
              data-version={""}
              data-active={v.revisionID === props.revisionID}
              onClick={() => {
                emit("selected", v.revisionID);
              }}
            >
              <Box sx={{ color: "sys.primary" }} component={"span"} data-version-base="">
                {props.base}
              </Box>
              <span>{v.version.slice(props.base.length + 1)}</span>
            </span>
          );
        })}
      </Wrap>
    );
  }
)({
  display: "flex",
  flexDirection: "column",
  maxHeight: 360,
  overflowY: "auto",
  overflowX: "hidden",

  $data_version: {
    display: "flex",
    flexDirection: "column",

    cursor: "pointer",

    width: "100%",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    py: 8,
    px: 8,

    textStyle: "sys.label-medium",
    font: "code",

    $data_version_base: {
      lineHeight: "1",
      fontSize: "0.7em",
      opacity: 0.7
    },

    _hover: {
      bgColor: "sys.surface-container-low"
    },

    _active: {
      containerStyle: "sys.primary-container"
    }
  }
});

const VersionExpandable = styled(
  "div",
  {
    expanded: t.boolean().optional(),
    $heading: t.custom<VNodeChild>().optional(),
    $default: t.custom<VNodeChild>().optional()
  },
  (props, { slots }) => {
    const expanded = observableRef(props.expanded);

    return (Wrap) => (
      <Wrap data-expanded={expanded.value}>
        <div
          data-expandable-heading=""
          onClick={() => (expanded.value = !expanded.value)}
        >
          {slots.heading?.()}
        </div>
        {expanded.value && (
          <div data-expandable-content="">{slots.default?.()}</div>
        )}
      </Wrap>
    );
  }
)({
  $data_expandable_heading: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    gap: 8,
    _hover: {
      bgColor: "sys.surface-container-low"
    }
  },

  $data_expandable_content: {
    py: 4
  },

  _expanded: {
    my: 8
  }
});

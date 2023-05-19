import type { Group, Kubepkg } from "@webapp/dashboard/client/dashboard";
import {
  component$,
  observableRef,
  useRequest,
  onMounted,
  rx,
  render,
  subscribeUntilUnmount,
  t,
  ref
} from "@nodepkg/runtime";
import { listGroup, listKubepkg } from "@webapp/dashboard/client/dashboard";
import {
  combineLatest,
  debounceTime,
  map as rxMap,
  merge,
  bufferTime,
  distinctUntilChanged
} from "@nodepkg/runtime/rxjs";
import { styled, Icon, mdiLoading, MenuItem, Menu } from "@nodepkg/ui";

export const GroupKubepkgAutocomplete = component$(
  {
    groupKubepkgName: t.string().optional(),
    onSelected: t.custom<(groupKubepkgName: string) => void>()
  },
  (props, { emit }) => {
    const inputRef = ref<HTMLInputElement>();
    const inputValue$ = observableRef(props.groupKubepkgName ?? "");
    const menuIsOpen$ = observableRef(false);

    const groups$ = observableRef([] as Group[]);
    const groupKubepkgs$ = observableRef({} as Record<string, Kubepkg[]>);

    const listGroup$ = useRequest(listGroup);
    const listKubepkg$ = useRequest(listKubepkg);

    const fetchKubepkgsOfGroup = (groupName: string) => {
      if (!groupKubepkgs$.value[groupName]) {
        listKubepkg$.next({
          groupName: groupName,
          size: -1
        });
      }
    };

    // TODO added keyboard controls

    onMounted(() => {
      // FIXME filter by group type
      listGroup$.next();
    });

    rx(
      inputValue$,
      debounceTime(300),
      subscribeUntilUnmount((inputValue) => {
        const [groupName, _] = inputValue.split("/");

        if (groupName) {
          if (groups$.value.find((g) => g.name === groupName)) {
            fetchKubepkgsOfGroup(groupName);
          }
        }
      })
    );

    rx(
      listGroup$,
      subscribeUntilUnmount((resp) => {
        groups$.value = resp.body || [];

        const [groupName, _] = inputValue$.value.split("/");
        if (groupName && groups$.value.find((g) => g.name === groupName)) {
          fetchKubepkgsOfGroup(groupName);
        }
      })
    );

    rx(
      listKubepkg$,
      subscribeUntilUnmount((resp) => {
        groupKubepkgs$.next((kubepkgs) => {
          kubepkgs[resp.config.inputs.groupName] = resp.body ?? [];
        });
      })
    );

    const loadingEl = rx(
      merge(listGroup$.requesting$, listKubepkg$.requesting$),
      bufferTime(300),
      rxMap((requestings) => requestings.some((v) => v)),
      distinctUntilChanged(),
      render((requesting) => {
        return requesting ? (
          <Icon path={mdiLoading} animate placement="end" />
        ) : null;
      })
    );

    const menuEl = rx(
      combineLatest([inputValue$, groups$, groupKubepkgs$]),
      render(([inputValue, groups, groupKubepkgs]) => {
        const [groupName, kubepkgName] = inputValue.split("/");
        const kubepkgs = groupKubepkgs[`${groupName ?? ""}`] ?? [];

        return (
          <>
            {kubepkgs.length
              ? kubepkgs
                .filter((k, i) =>
                  kubepkgName ? k.name.startsWith(kubepkgName) : i <= 10
                )
                .map((kubepkg) => (
                  <MenuItem
                    data-value={`kubepkg:${kubepkg.group}/${kubepkg.name}`}
                  >
                    {kubepkg.group}/{kubepkg.name}
                  </MenuItem>
                ))
              : groups
                .filter((g, i) =>
                  groupName ? g.name.startsWith(groupName) : i <= 10
                )
                .map((group) => (
                  <MenuItem data-value={`group:${group.name}`}>
                    {group.name}
                  </MenuItem>
                ))}
          </>
        );
      })
    );

    return () => {
      return (
        <Menu
          isOpen={menuIsOpen$.value}
          onDidClose={() => (menuIsOpen$.value = false)}
          disabled={!groups$.value.length}
          $menu={menuEl}
          fullWidth
          onSelected={(v) => {
            const [type, typeValue] = v.split(":");

            if (type === "group") {
              inputValue$.value = `${typeValue}/`;

              setTimeout(() => {
                inputRef.value?.focus();
              });
            }

            if (type === "kubepkg") {
              inputValue$.value = typeValue!;
              emit("selected", typeValue!);
            }
          }}
        >
          <InputControl data-focus={menuIsOpen$.value}>
            <input
              data-input={""}
              type="text"
              ref={inputRef}
              placeholder={"<group>/<kubepkg_name>"}
              value={inputValue$.value}
              onInput={(e) =>
                (inputValue$.value = (
                  e.target as HTMLInputElement
                ).value).trim()
              }
              onFocus={() => (menuIsOpen$.value = true)}
            />
            {loadingEl}
          </InputControl>
        </Menu>
      );
    };
  }
);

const InputControl = styled("div")({
  height: 48,
  px: 12,
  display: "flex",
  alignItems: "center",
  width: "100%",
  textStyle: "sys.title-medium",

  $data_input: {
    flex: 1,
    width: "100%",
    color: "inherit",
    border: "none",
    outline: "none",
    bgColor: "rgba(0,0,0,0)"
  }
});

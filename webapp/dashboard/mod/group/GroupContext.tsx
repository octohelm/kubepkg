import {
  createProvider,
  component$,
  useRequest,
  t,
  rx,
  render,
  subscribeUntilUnmount,
  subscribeOnMountedUntilUnmount,
  type VNodeChild,
  observableRef
} from "@nodepkg/runtime";
import { type Group, getGroup } from "@webapp/dashboard/client/dashboard";
import {
  AccessControlProvider,
  createCanAccess
} from "@webapp/dashboard/mod/auth";
import { map } from "@nodepkg/runtime/rxjs";
import { styled, alpha, variant } from "@nodepkg/ui";

export const GroupProvider = createProvider(
  () => observableRef<Group>({} as Group),
  {
    name: "Group"
  }
);

export const GroupContext = component$(
  {
    groupName: t.string(),
    $default: t.custom<VNodeChild>().optional()
  },
  (props, { slots }) => {
    const group$ = observableRef<Group>({
      name: props.groupName
    } as Partial<Group> as any);
    const get$ = useRequest(getGroup);

    rx(
      get$,
      map((resp) => resp.body),
      subscribeUntilUnmount(group$.next)
    );

    rx(
      props.groupName$,
      subscribeOnMountedUntilUnmount((groupName) => {
        get$.next({
          groupName: groupName
        });
      })
    );

    return () => {
      return (
        <GroupProvider value={group$}>
          <AccessControlProvider
            value={{
              canAccess: createCanAccess(() => group$.value.groupID)
            }}
          >
            {slots.default?.()}
          </AccessControlProvider>
        </GroupProvider>
      );
    };
  }
);

export const GroupTitle = component$(() => {
  const group$ = GroupProvider.use();

  return rx(
    group$,
    render((group) => {
      return (
        <StyledGroupTitle>
          {group?.name}
          <span data-role="description">{group?.desc}</span>
        </StyledGroupTitle>
      );
    })
  );
});

const StyledGroupTitle = styled("h1")({
  p: 0,
  m: 0,

  color: "sys.secondary",

  textStyle: "sys.title-large",
  display: "flex",
  flexDirection: "column",

  $data_role__description: {
    textStyle: "sys.body-small",
    color: variant("sys.secondary", alpha(0.68))
  }
});

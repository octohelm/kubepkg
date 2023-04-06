import { TextButton, styled } from "@nodepkg/ui";
import type { Group } from "@webapp/dashboard/client/dashboard";
import {
  RouterLink,
  component$,
  rx,
  render,
  t,
  type VNodeChild
} from "@nodepkg/runtime";
import { GroupType } from "@webapp/dashboard/client/dashboard";

export const GroupCard = component$(
  {
    group: t.custom<Group>(),
    $action: t.custom<VNodeChild>().optional()
  },
  (props, { slots }) => {
    return rx(
      props.group$,
      render((group) => (
        <Card
          data-group-type={group.type}
          sx={{
            minWidth: 320,
            minHeight: 160,
            [`&[data-group-type=${GroupType.DEPLOYMENT}]`]: {
              containerStyle: "sys.error-container"
            }
          }}
          $action={
            <>
              <TextButton component={RouterLink} to={`/groups/${group.name}`}>
                访问
              </TextButton>
              {slots.action && <CardAction>{slots.action()}</CardAction>}
            </>
          }
        >
          <CardHeading>{group.name}</CardHeading>
          <CardInfo>{group.desc}</CardInfo>
        </Card>
      ))
    );
  }
);

const CardHeading = styled("div")({
  textStyle: "sys.headline-small"
});

const CardAction = styled("div")({
  display: "flex",
  flexDirection: "row",
  flex: 1
});

const CardInfo = styled("div")({
  textStyle: "sys.body-medium"
});

const Card = styled(
  "div",
  {
    $action: t.custom<VNodeChild>().optional(),
    $default: t.custom<VNodeChild>().optional()
  },
  ({}, { slots }) => {
    return (Wrap) => {
      return (
        <Wrap>
          <div data-card-content="">{slots.default?.()}</div>
          {slots.action && <div data-card-action="">{slots.action()}</div>}
        </Wrap>
      );
    };
  }
)({
  pt: 16,
  pb: 8,
  px: 16,
  rounded: "md",
  containerStyle: "sys.surface-container-highest",
  elevation: "0",
  display: "flex",
  flexDirection: "column",
  gap: 8,

  $data_card_content: {
    flex: 1
  },

  $data_card_action: {
    display: "flex",
    flexDirection: "row-reverse",
    gap: 8
  }
});

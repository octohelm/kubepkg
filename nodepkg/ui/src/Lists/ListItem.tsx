import { styled } from "@innoai-tech/vueuikit";
import { t } from "@nodepkg/runtime";
import { type VNode } from "vue";

export const ListItem = styled(
  "div",
  {
    $heading: t.custom<VNode>().optional(),
    $supporting: t.custom<VNode>().optional(),
    $trailing: t.custom<VNode>().optional(),
    $leading: t.custom<VNode>().optional(),
  },
  (_, { slots }) => {
    return (Container) => (
      <Container>
        {slots.leading?.()}
        {(slots.heading || slots.supporting) && (
          <div data-role={"info"}>
            {slots.heading && <h3 data-role={"heading"}>{slots.heading()}</h3>}
            {slots.supporting && (
              <p data-role={"supporting"}>{slots.supporting()}</p>
            )}
          </div>
        )}
        {slots.trailing && <div data-role={"trailing"}>{slots.trailing()}</div>}
      </Container>
    );
  },
)({
  containerStyle: "inherit",
  display: "flex",
  py: 8,
  px: 24,
  minH: 72,
  alignItems: "center",
  gap: 8,

  $data_role__info: {
    display: "flex",
    flexDirection: "column",
    flex: 1,

    $data_role__heading: {
      p: 0,
      m: 0,
      textStyle: "sys.body-large",
    },

    $data_role__supporting: {
      p: 0,
      m: 0,
      textStyle: "sys.body-medium",
      color: "sys.on-surface-variant",
    },
  },

  $data_role__trailing: {
    $data_icon: {
      boxSize: 20,
    },
    mr: -8,
  },
});

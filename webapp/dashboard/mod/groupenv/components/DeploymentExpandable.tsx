import { t, type VNodeChild, observableRef } from "@innoai-tech/vuekit";
import { styled } from "@innoai-tech/vueuikit";

export const DeploymentExpandable = styled(
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
    gap: 4,
    _hover: {
      bgColor: "sys.surface-container-low"
    }
  },

  $data_expandable_content: {
    py: 8,
  },

  _expanded: {
    my: 16,
    py: 12,

    $data_expandable_content: {
      bgColor: "sys.surface-container-low"
    }
  }
});

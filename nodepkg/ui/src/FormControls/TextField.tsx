import { t, type VNodeChild } from "@nodepkg/runtime";
import { styled } from "@innoai-tech/vueuikit";
import { get } from "@nodepkg/runtime/lodash";
import { cloneVNode } from "vue";

export const TextField = styled(
  "label",
  {
    valued: t.boolean().optional(),
    focus: t.boolean().optional(),
    invalid: t.boolean().optional(),
    disabled: t.boolean().optional(),

    $label: t.custom<VNodeChild>().optional(),
    $supporting: t.custom<VNodeChild>().optional(),
    $leading: t.custom<VNodeChild>().optional(),
    $trailing: t.custom<VNodeChild>().optional(),
    $default: t.custom<VNodeChild>(),
  },
  (props, { slots }) => {
    return (Wrap) => {
      let valued = props.valued;
      let invalid = props.invalid;
      let disabled = props.disabled;

      const children = (slots.default?.() ?? []).map((c) => {
        if (c.type === "input") {
          valued = !!get(
            c.props,
            ["value"],
            get(c.props, ["placeholder"], valued),
          );

          disabled = get(c.props, ["disabled"], disabled);

          return cloneVNode(c, {
            disabled: disabled,
          });
        }
        return cloneVNode(c);
      });

      return (
        <Wrap
          data-valued={valued}
          data-invalid={invalid}
          data-disabled={disabled}
          data-focus-within={props.focus}
          data-has-leading={!!slots.leading}
          data-has-trailing={!!slots.trailing}
        >
          <div data-input-container="">
            {slots.leading && <Maker role="leading">{slots.leading()}</Maker>}
            <div data-input-label="">{slots.label?.()}</div>
            {children}
            {slots.trailing && (
              <Maker role={"trailing"}>{slots.trailing()}</Maker>
            )}
          </div>
          {slots.supporting && (
            <div data-input-supporting="">{slots.supporting?.()}</div>
          )}
        </Wrap>
      );
    };
  },
)({
  display: "block",
  pos: "relative",
  textStyle: "sys.body-large",

  $data_input_container: {
    pos: "relative",
  },

  $data_input: {
    outline: "none",
    flex: 1,
    w: "100%",

    m: 0,

    px: 16,
    py: 4,
    minHeight: 56,

    bg: "none",
    border: "none",

    cursor: "text",
    "&[readonly]": {
      cursor: "pointer",
    },

    bgColor: "sys.surface-container-highest",
    color: "sys.on-surface",

    roundedTop: "xs",

    borderBottom: "1px solid",
    borderColor: "sys.outline-variant",

    textStyle: "sys.body-large",

    transitionDuration: "sm1",
    transitionTimingFunction: "standard",
  },

  $data_input_label: {
    pos: "absolute",
    top: 4,
    bottom: 4,
    left: 16,

    color: "sys.on-surface-variant",

    display: "flex",
    alignItems: "center",
    transitionDuration: "sm2",
    transitionTimingFunction: "standard-accelerate",
  },

  $data_input_supporting: {
    textStyle: "sys.body-small",
    px: 16,
    pt: 4,
    display: "flex",
    gap: 16,

    color: "sys.on-surface-variant",
  },

  _has_leading: {
    $data_input: {
      pl: 16 + 20,
    },
    $data_input_label: {
      left: 16 + 20,
    },
  },

  _has_trailing: {
    $data_input: {
      pr: 12 + 20,
    },
  },

  _valued: {
    $data_input: {
      pt: 18,
    },

    $data_input_label: {
      top: 8,
      bottom: "auto",
      textStyle: "sys.body-small",
    },
  },

  _focusWithin: {
    $data_input: {
      pt: 18,
      borderBottom: "2px solid",
      borderColor: "sys.primary",
    },

    $data_input_label: {
      top: 8,
      bottom: "auto",
      textStyle: "sys.body-small",
      color: "sys.primary",
    },
  },

  _invalid: {
    $data_input: {
      borderBottom: "2px solid",
      borderColor: "sys.error",
    },

    $data_input_label: {
      color: "sys.error",
    },

    $data_input_supporting: {
      color: "sys.error",
    },
  },

  _disabled: {
    opacity: 0.38,
    cursor: "not-allowed",
  },
});

const Maker = styled("div", {
  role: t.enums(["leading", "trailing"]),
})({
  pos: "absolute",
  top: 4,
  bottom: 4,
  display: "flex",
  alignItems: "center",
  color: "sys.on-surface-variant",

  _role__leading: {
    left: 12,

    $data_icon: {
      ml: -4,
    },
  },

  _role__trailing: {
    right: 12,

    $data_icon: {
      mr: -4,
    },
  },
});

import { Popper, styled, variant, alpha } from "@innoai-tech/vueuikit";
import { component, t } from "@nodepkg/runtime";
import { type VNodeChild, cloneVNode, ref, watch } from "vue";
import { sameWidthModifier } from "./util";

const MenuContainer = styled("div")({
  py: 8,
  rounded: "sm",
  shadow: "2",
  minW: 120,
  containerStyle: "sys.surface-container",
  pos: "relative",
  zIndex: 100
});

export const MenuItem = styled("div", {
  active: t.boolean().optional()
})({
  "& + &": {
    borderTop: "1px solid",
    borderColor: "sys.outline-variant"
  },
  py: 8,
  px: 16,
  textStyle: "sys.label-large",

  containerStyle: "sys.surface-container",

  _hover: {
    cursor: "pointer",
    bgColor: variant("sys.on-surface", alpha(0.08))
  },

  _focus: {
    bgColor: variant("sys.on-surface", alpha(0.08))
  },

  _active: {
    bgColor: variant("sys.on-surface", alpha(0.08))
  }
});

export const Menu = component(
  {
    isOpen: t.boolean().optional(),
    disabled: t.boolean().optional(),
    fullWidth: t.boolean().optional(),
    placement: t.custom<import("@popperjs/core").Placement>().optional(),

    onDidOpen: t.custom<() => void>(),
    onDidClose: t.custom<() => void>(),
    onSelected: t.custom<(value: string) => void>(),

    $menu: t.custom<VNodeChild>(),
    $default: t.custom<VNodeChild>()
  },
  (props, { slots, emit }) => {
    const isOpen = ref(false);

    watch(
      () => props.isOpen,
      (o) => {
        isOpen.value = o ?? isOpen.value;
      }
    );

    watch(
      () => isOpen.value,
      (o) => {
        if (o) {
          emit("did-open");
        } else {
          emit("did-close");
        }
      }
    );

    const handleTriggerClick = () => {
      isOpen.value = true;
    };

    const handleItemClick = (e: Event) => {
      const target = [e.target, ...e.composedPath()].find((t) => {
        return (t as HTMLElement)?.hasAttribute?.("data-value");
      });

      if (target) {
        const dataValue = (target as HTMLElement)?.getAttribute("data-value");
        if (dataValue !== null) {
          emit("selected", dataValue);
          isOpen.value = false;
        }
      }
    };

    return () => {
      const trigger = slots.default?.()[0];

      return (
        <Popper
          isOpen={isOpen.value}
          onClickOutside={() => {
            isOpen.value = false;
          }}
          placement={props.fullWidth ? "bottom-start" : props.placement}
          modifiers={props.fullWidth ? [sameWidthModifier] : undefined}
          $content={
            <MenuContainer onClick={handleItemClick}>
              {slots.menu?.() ?? []}
            </MenuContainer>
          }
        >
          {trigger
            ? !props.disabled
              ? cloneVNode(trigger, {
                onClick: handleTriggerClick
              })
              : cloneVNode(trigger, {
                "data-disabled": props.disabled
              })
            : null}
        </Popper>
      );
    };
  }
);

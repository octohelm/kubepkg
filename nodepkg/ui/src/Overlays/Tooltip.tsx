import {
  defineTransition,
  transition,
  Popper,
  styled
} from "@innoai-tech/vueuikit";

import { component, t, type VNodeChild } from "@nodepkg/runtime";
import { cloneVNode, ref } from "vue";

const FadeInOutTransition = defineTransition(
  {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    },
    duration: transition.duration.md1,
    easing: transition.easing.standard.accelerate
  },
  {
    from: {
      opacity: 1
    },
    to: {
      opacity: 0
    },
    duration: transition.duration.sm4,
    easing: transition.easing.standard.decelerate
  }
);

const TooltipContainer = styled("div")({
  py: 4,
  px: 12,
  rounded: "sm",
  shadow: "3",
  containerStyle: "sys.on-surface",
  textStyle: "sys.body-small",
  pos: "relative",
  zIndex: 100,
  pointerEvents: "none"
});

export const Tooltip = component(
  {
    title: t.custom<VNodeChild>().optional(),
    $default: t.custom<VNodeChild>().optional()
  },
  (props, { slots }) => {
    const isOpen = ref(false);
    const triggerRef = ref<HTMLElement | null>(null);

    return () => {
      const child = slots.default ? slots.default()[0] : null;

      return !props.title ? (
        child
      ) : (
        <Popper
          isOpen={isOpen.value}
          onClickOutside={() => (isOpen.value = false)}
          $transition={({ content }) => (
            <FadeInOutTransition>{content}</FadeInOutTransition>
          )}
          $content={<TooltipContainer>{props.title}</TooltipContainer>}
        >
          {child
            ? cloneVNode(child, {
              onVnodeMounted: (node) => {
                triggerRef.value = resolveElement(node.el);
              },
              onMouseover: () => {
                isOpen.value = true;
              },
              onMouseleave: () => {
                isOpen.value = false;
              }
            })
            : null}
        </Popper>
      );
    };
  }
);

function resolveElement(el: any): HTMLElement | null {
  if (el) {
    if (el instanceof HTMLElement) {
      return el;
    }
    if (el instanceof Text) {
      return resolveElement(el.nextElementSibling);
    }
  }
  return null;
}

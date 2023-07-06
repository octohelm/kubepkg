import { createPopperModifier } from "@innoai-tech/vueuikit";

export const sameWidthModifier = createPopperModifier(
  ({ state }) => {
    state.styles!["popper"]!.width = `${state.rects.reference.width}px`;
  },
  {
    name: "sameWidth",
    phase: "beforeWrite",
    requires: ["computeStyles"],
  },
);

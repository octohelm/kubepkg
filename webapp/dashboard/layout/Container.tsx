import { styled } from "@nodepkg/ui";
import { t, type VNodeChild } from "@nodepkg/runtime";
import { alpha, variant } from "@innoai-tech/vueuikit";

export const Container = styled(
  "div",
  {
    $toolbar: t.custom<VNodeChild>().optional(),
    $action: t.custom<VNodeChild>().optional(),
    $default: t.custom<VNodeChild>().optional()
  },
  ({}, { slots }) =>
    (Wrap) =>
      (
        <Wrap>
          <div data-bar="">
            <div data-toolbar="">{slots.toolbar?.()}</div>
            <div data-action=""> {slots.action?.()}</div>
          </div>
          <div data-content="">{slots.default?.()}</div>
        </Wrap>
      )
)({
  pos: "relative",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  height: "100%",
  flex: 1,
  "& > [data-bar]": {
    pos: "relative",
    containerStyle: "sys.surface",
    height: 48,
    borderBottom: "1px solid",
    borderColor: variant("sys.outline-variant", alpha(0.38)),
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    zIndex: 1,
    px: 16,
    gap: 16,
    "& > [data-toolbar]": {
      flex: 1,
      display: "flex",
      alignItems: "center"
    },
    "& > [data-action]": {
      display: "flex",
      alignItems: "center"
    }
  },
  "& > [data-content]": {
    flex: 1,
    overflow: "auto"
  }
});

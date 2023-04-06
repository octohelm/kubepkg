import { styled, variant, alpha } from "@innoai-tech/vueuikit";
import { t } from "@nodepkg/runtime";

export const Divider = styled("hr", {
  orientation: t
    .enums(["vertical", "horizontal"])
    .optional()
    .default("horizontal"),
})({
  m: 0,
  borderWidth: "0px 0px thin",
  borderColor: variant("sys.outline-variant", alpha(0.38)),

  _data_orientation__vertical: {
    borderWidth: "0px thin 0px 0px",
    mx: 4,
    height: "auto",
    flexShrink: 0,
    alignSelf: "stretch",
  },
});

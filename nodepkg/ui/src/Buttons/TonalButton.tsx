import { styled, variant, alpha } from "@innoai-tech/vueuikit";
import { ButtonBase } from "./ButtonBase";

export const TonalButton = styled(ButtonBase)({
  containerStyle: "sys.secondary-container",

  color: "sys.primary",
  shadow: "0",

  _hover: {
    shadow: "1",
    _$before: {
      bgColor: variant("sys.on-secondary-container" as const, alpha(0.08)),
    },
  },

  _focus: {
    _$before: {
      bgColor: variant("sys.on-secondary-container" as const, alpha(0.12)),
    },
  },

  _active: {
    _$before: {
      bgColor: variant("sys.on-secondary-container" as const, alpha(0.12)),
    },
  },

  _disabled: {
    color: variant("sys.on-surface", alpha(0.38)),
    bgColor: "rgba(0,0,0,0)",
    shadow: "0",
    _$before: {
      bgColor: variant("sys.on-surface" as const, alpha(0.12)),
    },
  },
});

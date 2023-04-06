import { styled, variant, alpha } from "@innoai-tech/vueuikit";
import { ButtonBase } from "./ButtonBase";

export const FilledButton = styled(ButtonBase)({
  containerStyle: "sys.primary",

  shadow: "1",

  _hover: {
    shadow: "2",
    _$before: {
      bgColor: variant("white", alpha(0.08)),
    },
  },

  _focus: {
    shadow: "2",
    _$before: {
      bgColor: variant("white", alpha(0.12)),
    },
  },

  _active: {
    shadow: "2",
    _$before: {
      bgColor: variant("white", alpha(0.12)),
    },
  },

  _disabled: {
    shadow: "0",
    color: variant("sys.on-surface", alpha(0.38)),
    bgColor: "rgba(0,0,0,0)",

    _$before: {
      bgColor: variant("sys.on-surface", alpha(0.12)),
    },
  },
});

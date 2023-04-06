import { styled, variant, alpha } from "@innoai-tech/vueuikit";
import { ButtonBase } from "./ButtonBase";

export const ElevatedButton = styled(ButtonBase)({
  color: "sys.primary",
  shadow: "1",
  _$before: {
    bgColor: "sys.surface-container-low",
  },

  _hover: {
    shadow: "2",
    _$before: {
      bgColor: variant("sys.primary" as const, alpha(0.08)),
    },
  },

  _focus: {
    shadow: "2",
    _$before: {
      bgColor: variant("sys.primary" as const, alpha(0.12)),
    },
  },

  _active: {
    shadow: "2",
    _$before: {
      bgColor: variant("sys.primary" as const, alpha(0.12)),
    },
  },

  _disabled: {
    shadow: "0",
    color: variant("sys.on-surface", alpha(0.38)),
    _$before: {
      bgColor: variant("sys.on-surface" as const, alpha(0.12)),
    },
  },
});

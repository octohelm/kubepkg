import { styled, variant, alpha } from "@innoai-tech/vueuikit";
import { ButtonBase } from "./ButtonBase";

export const TextButton = styled(ButtonBase)({
  extends: [
    {
      px: 16,

      $data_icon: {
        _data_placement__start: {
          ml: -4,
        },
        _data_placement__end: {
          mr: -4,
        },
      },
    },
  ],

  color: "sys.primary",

  _$before: {
    bgColor: "rgba(0,0,0,0)",
  },

  _hover: {
    _$before: {
      bgColor: variant("sys.primary" as const, alpha(0.08)),
    },
  },

  _focus: {
    _$before: {
      bgColor: variant("sys.primary" as const, alpha(0.12)),
    },
  },

  _active: {
    _$before: {
      bgColor: variant("sys.primary" as const, alpha(0.12)),
    },
  },

  _disabled: {
    color: variant("sys.on-surface", alpha(0.38)),
    bgColor: "rgba(0,0,0,0)",

    _$before: {
      bgColor: "rgba(0,0,0,0)",
    },
  },
});

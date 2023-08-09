import { Theming, Palette, defaultTheme } from "@innoai-tech/vueuikit";

const theme = {
  ...defaultTheme,
  ...Palette.fromColors({
    primary: "#1AA3DB"
    // secondary: "#F18A00",
  }).toDesignTokens()
};

export const theming = Theming.create(theme, { varPrefix: "vk" });

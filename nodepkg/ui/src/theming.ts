import { Theming, Palette, defaultTheme } from "@innoai-tech/vueuikit";

const theme = {
  ...defaultTheme,
  ...Palette.fromColors({
    primary: "#1AA3DB",
    // secondary: "#F18A00",

    pink: "#ff00ff",
    green: "#4caf50",
    yellow: "#ffcd38",
    orange: "#ff9800",
    blue: "#03a9f4",
  }).toDesignTokens(),
};

export const theming = Theming.create(theme, { varPrefix: "vk" });

import { createProvider } from "@innoai-tech/vuekit";

export const parse = (userAgent: string = navigator?.userAgent) => {
  return {
    os: {
      mac: /Mac/.test(userAgent),
      windows: /Win/.test(userAgent),
      linux: /Linux|X11/.test(userAgent),
    },
  };
};

export const PlatformProvider = createProvider(
  () => {
    return parse();
  },
  {
    name: "Platform",
  },
);

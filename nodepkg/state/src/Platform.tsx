import { createContext, ReactNode, useContext, useMemo } from "react";

export const parse = (userAgent: string = navigator?.userAgent) => {
  return {
    os: {
      mac: /Mac/.test(userAgent),
      windows: /Win/.test(userAgent),
      linux: /Linux|X11/.test(userAgent)
    }
  };
};


const PlatformContext = createContext(parse());

export const usePlatform = () => useContext(PlatformContext);

export const PlatformContextProvider = ({ userAgent, children }: { userAgent: string, children?: ReactNode }) => {
  const p = useMemo(() => parse(userAgent), [userAgent]);

  return <PlatformContext.Provider value={p}>
    {children}
  </PlatformContext.Provider>;
};

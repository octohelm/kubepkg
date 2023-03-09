import { useMemo, useRef } from "react";

export const useExt = <T extends {}, E extends { [k: string]: any }>(
  target: T,
  extensions: E
) => {
  const extensionsRef = useRef(extensions);

  return useMemo(
    () =>
      new Proxy(target, {
        get: (_, prop) => {
          return extensionsRef.current[prop as string] || (target as any)[prop];
        },
      }) as T & E,
    [target]
  );
};

import { useStore$, Domain } from "@innoai-tech/reactutil";
import { createContext, ReactNode, useContext, useMemo } from "react";
import type { Observable } from "rxjs";
import { useProxy } from "./Proxy";

const useDomain$ = <T, E extends { [k: string]: any }>(
  domain: string,
  initials: T,
  extensions: E,
  ...epics: Array<(subject$: Domain<T, {}> & E) => Observable<T>>
) => {
  const store$ = useStore$();
  const domain$ = useMemo(() => store$.domain(domain, initials), [domain]);
  return useProxy(domain$, extensions, ...epics);
};

export const createDomain = <T extends any,
  E extends { [k: string]: any },
  TProps extends {}>(
  useProvider: (
    props: TProps,
    use: typeof useDomain$
  ) => ReturnType<typeof useDomain$<T, E>>
) => {
  const key = Symbol("domain");

  const C = createContext<{ [key]: ReturnType<typeof useProvider> }>({} as any);

  const Provider = ({
                      children,
                      ...props
                    }: TProps & {
    children: ReactNode;
  }) => {
    const domain$ = useProvider(props as any, useDomain$);

    return <C.Provider value={{ [key]: domain$ }}>{children}</C.Provider>;
  };

  Provider.use$ = (): ReturnType<typeof useProvider> => useContext(C)[key];

  return Provider;
};

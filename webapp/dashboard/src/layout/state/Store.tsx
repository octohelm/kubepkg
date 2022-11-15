import { values } from "@innoai-tech/lodash";
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

export const createProvider = <C extends any>(ctx: C) => {
  const key = Symbol("domain");

  const Context = createContext<{ [K: symbol]: C }>({ [key]: ctx });

  const use = () => {
    return useContext(Context)[key]!;
  };

  const Provider = ({
    children,
    value,
  }: {
    value: Partial<C>;
    children: ReactNode;
  }) => {
    const parent = use();

    const next = useMemo(
      () => ({
        ...(parent ? parent : {}),
        ...value,
      }),
      [parent, ...values(value)]
    );

    return (
      <Context.Provider value={{ [key]: next as any }}>
        {children}
      </Context.Provider>
    );
  };

  Provider.use = use;

  return Provider;
};

export const createDomain = <
  T extends any,
  E extends { [k: string]: any },
  TProps extends {}
>(
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
    return (
      <C.Provider key={domain$.name} value={{ [key]: domain$ }}>
        {children}
      </C.Provider>
    );
  };

  Provider.use$ = (): ReturnType<typeof useProvider> => useContext(C)[key];

  return Provider;
};

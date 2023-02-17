import { isFunction, omit, values } from "@innoai-tech/lodash";
import { useStore$, Domain, useObservableEffect } from "@innoai-tech/reactutil";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { from, Observable, tap } from "rxjs";
import { useProxy } from "./Proxy";

export const createProvider = <
  C extends {},
  TProps extends {} = { value: Partial<C> }
>(
  ctxOrBuilder: C | ((props: TProps) => C)
) => {
  const key = Symbol("Provider");

  const Context = createContext({
    [key]: isFunction(ctxOrBuilder) ? undefined : (ctxOrBuilder as any),
  });

  const use = () => {
    return useContext(Context)[key]! as C;
  };

  const createContextValues = (
    isFunction(ctxOrBuilder)
      ? ctxOrBuilder
      : ({ value }: { value: Partial<C> }) => value
  ) as (props: TProps) => C;

  const Provider = (props: { children: ReactNode } & TProps) => {
    const parent = use();
    const otherProps = omit(props, "children") as unknown as TProps;

    const next = useMemo(() => {
      const next = createContextValues(otherProps);

      return new Proxy(next, {
        get(target: any, p: string | symbol): any {
          return target[p]
            ? target[p]
            : parent
            ? (parent as any)[p]
            : undefined;
        },
      });
    }, [parent, ...values(otherProps)]);

    return (
      <Context.Provider value={{ [key]: next as any }}>
        {props.children}
      </Context.Provider>
    );
  };

  Provider.use = use;

  return Provider;
};

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

type ImporterReturns<T extends ReadonlyArray<() => Promise<{}>>> = {
  readonly [K in keyof T]: Awaited<ReturnType<T[K]>>;
};

export const fromAsyncModules = <
  TDep extends ReadonlyArray<() => Promise<{}>>,
  TExports
>(
  deps: Readonly<TDep>,
  create: (...imports: ImporterReturns<TDep>) => TExports
) => {
  const key = Symbol("async modules");

  const Context = createContext<{ [K: symbol]: ReturnType<typeof create> }>(
    {} as any
  );

  const use = () => {
    return useContext(Context)[key]!;
  };

  const Provider = ({ children }: { children: ReactNode }) => {
    const [exports, setExports] = useState<ReturnType<typeof create> | null>(
      null
    );

    useObservableEffect(() => {
      return from(Promise.all(deps.map((m) => m()))).pipe(
        tap((list) => {
          return setExports(create(...(list as any)));
        })
      );
    }, []);

    return exports ? (
      <Context.Provider value={{ [key]: exports as any }}>
        {children}
      </Context.Provider>
    ) : null;
  };

  Provider.use = use;

  return Provider;
};

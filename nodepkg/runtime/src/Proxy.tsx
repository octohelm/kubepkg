import { isFunction } from "@innoai-tech/lodash";
import {
  StateSubject,
  useStateSubject,
  useObservableEffect
} from "@innoai-tech/reactutil";
import { createContext, ReactNode, useContext, useMemo, useRef } from "react";
import {
  from,
  merge,
  Observable,
  mergeMap,
  tap,
  distinctUntilChanged
} from "rxjs";

/**
 * @deprecated
 */
export const useEpics = <D, T extends Observable<D>>(
  ob$: T,
  ...epics: Array<(subject$: T) => Observable<D>>
) => {
  return useObservableEffect(() => {
    if (epics.length === 0) {
      return;
    }

    return merge(epics.map((epic) => epic(ob$))).pipe(
      mergeMap((output$) => from(output$)),
      distinctUntilChanged((a, b) => a === b),
      tap((output) => {
        if (isFunction((ob$ as any).next)) {
          (ob$ as any).next(output);
        }
      })
    );
  }, [ob$]);
};

export const Epics = <D, T extends Observable<D>>({
                                                    ob$,
                                                    epics
                                                  }: {
  ob$: T;
  epics: Array<(subject$: T) => Observable<D>>;
}) => {
  useEpics(ob$, ...epics);
  return null;
};

/**
 * @deprecated
 */
export const useProxy = <
  T extends any,
  S extends Observable<T>,
  E extends { [k: string]: any }
>(
  ob$: S,
  extensions: E,
  ...epics: Array<(subject$: S & E) => Observable<T>>
) => {
  const extensionsRef = useRef(extensions);

  const s$ = useMemo(() => {
    return new Proxy(ob$, {
      get: (_, prop) => {
        return extensionsRef.current[prop as string] || (ob$ as any)[prop];
      }
    }) as S & E;
  }, [ob$]);

  useEpics(s$, ...epics);

  return s$;
};

/**
 * @deprecated
 */
const useSubject$ = <T, E extends { [k: string]: any }>(
  initials: T,
  extensions: E,
  ...epics: Array<(subject$: StateSubject<T> & E) => Observable<T>>
) => {
  return useProxy(useStateSubject(initials), extensions, ...epics);
};

export const createSubject = <
  T extends any,
  E extends { [k: string]: any },
  TProps extends {}
>(
  useProvider: (
    props: TProps,
    use: typeof useSubject$
  ) => ReturnType<typeof useSubject$<T, E>>
): {
  ({ children, ...props }: TProps & {
    children: ReactNode;
  }): JSX.Element;
  use$(): StateSubject<T> & E;
} => {
  const key = Symbol("subject");

  const C = createContext<{ [key]: ReturnType<typeof useProvider> }>({} as any);

  const Provider = ({
                      children,
                      ...props
                    }: TProps & {
    children: ReactNode;
  }) => {
    const subject$ = useProvider(props as any, useSubject$);

    return <C.Provider value={{ [key]: subject$ }}>{children}</C.Provider>;
  };

  Provider.use$ = (): ReturnType<typeof useProvider> => useContext(C)[key];

  return Provider;
};

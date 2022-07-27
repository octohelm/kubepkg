import { isFunction } from "@innoai-tech/lodash";
import { StateSubject, useStateSubject } from "@innoai-tech/reactutil";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef
} from "react";
import { from, merge, Observable } from "rxjs";
import { mergeMap, tap } from "rxjs/operators";

export const useEpics = <D, T extends Observable<D>>(
  ob$: T,
  ...epics: Array<(subject$: T) => Observable<D>>
) => {
  return useEffect(() => {
    if (epics.length === 0) {
      return;
    }

    const sub = merge(epics.map((epic) => epic(ob$)))
      .pipe(
        mergeMap((output$) => from(output$)),
        tap((output) => {
          if (isFunction((ob$ as any).next)) {
            (ob$ as any).next(output);
          }
        })
      )
      .subscribe();

    return () => sub.unsubscribe();
  }, [ob$]);
};

export const useProxy = <T extends any,
  S extends Observable<T>,
  E extends { [k: string]: any }>(
  ob$: S,
  extensions: E,
  ...epics: Array<(subject$: S & E) => Observable<T>>
) => {
  const extensionsRef = useRef(extensions);

  const s$ = useMemo(() => {
    return new Proxy(ob$, {
      get: (_, prop) => {
        return (
          extensionsRef.current[prop as string] || (ob$ as any)[prop]
        );
      }
    }) as S & E;
  }, [ob$]);

  useEpics(s$, ...epics);

  return s$;
};

const useSubject$ = <T, E extends { [k: string]: any }>(
  initials: T,
  extensions: E,
  ...epics: Array<(subject$: StateSubject<T> & E) => Observable<T>>
) => {
  return useProxy(useStateSubject(initials), extensions, ...epics);
};

export const createSubject = <T extends any,
  E extends { [k: string]: any },
  TProps extends {}>(
  useProvider: (
    props: TProps,
    use: typeof useSubject$
  ) => ReturnType<typeof useSubject$<T, E>>
) => {
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

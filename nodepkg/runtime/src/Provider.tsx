import { get, isFunction, omit, values } from "@innoai-tech/lodash";
import { createContext, ReactNode, useContext, useMemo } from "react";


export const createProvider = <
  C extends {},
  TProps extends {} = { value: Partial<C> }
>(
  ctxOrBuilder: C | ((props: TProps, parent?: C) => C)
) => {
  const key = Symbol("provider");

  const Context = createContext({
    [key]: isFunction(ctxOrBuilder) ? undefined : (ctxOrBuilder as any)
  });

  const use = () => (useContext(Context)[key]! as C);

  const defaultBuilder = ({ value }: { value: Partial<C> }, parent?: C): C => new Proxy(value, {
    get(target: any, p: string | symbol): any {
      return get(target, [p], (parent ? (parent as any)[p] : undefined));
    }
  });

  const createContextValues = (isFunction(ctxOrBuilder) ? ctxOrBuilder : defaultBuilder) as (props: TProps, parent?: C) => C;

  const Provider = (props: { children?: ReactNode } & TProps) => {
    const parent = use();
    const otherProps = omit(props, "children") as unknown as TProps;

    const next = useMemo(() => createContextValues(otherProps, parent), [parent, ...values(otherProps)]);

    return (
      <Context.Provider value={{ [key]: next as any }}>
        {props.children}
      </Context.Provider>
    );
  };

  Provider.use = use;

  return Provider;
};
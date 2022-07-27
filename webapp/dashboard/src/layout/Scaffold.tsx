import { ReactNode, createContext, FunctionComponent, useContext } from "react";

const ScaffoldContext = createContext<{
  Scaffold: FunctionComponent<ScaffoldProps>;
}>({ Scaffold: () => null });

export const ScaffoldProvider = ScaffoldContext.Provider;

export interface ScaffoldProps {
  action?: ReactNode;
  toolbar?: ReactNode;
  children?: ReactNode;
}

export const Scaffold = (props: ScaffoldProps) => {
  const Scaffold = useContext(ScaffoldContext).Scaffold;

  return <Scaffold {...props} />;
};

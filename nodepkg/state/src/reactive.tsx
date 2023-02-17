import type { Observable } from "rxjs";
import { useObservableState } from "@innoai-tech/reactutil";

export const Slot = ({ elem$ }: { elem$: Observable<JSX.Element | null> }) => {
  return <>{useObservableState(elem$)}</>;
};

import { Observable, Subject } from "rxjs";

export const create = <T extends Event>(): Observable<T> &
  ((event: T) => {}) => {
  const event$ = new Subject<T>();

  return new Proxy((event: T) => event$.next(event), {
    get(_, p: string | symbol): any {
      return (event$ as any)[p];
    },
  }) as any;
};

import { tap } from "rxjs";

export const stopPropagation = <T extends Event>() => {
  return tap((e: T) => e.stopPropagation());
};

export const preventDefault = <T extends Event>() => {
  return tap((e: T) => e.preventDefault());
};

import { distinctUntilChanged, Observable } from "@nodepkg/runtime/rxjs";
import { rx, subscribeUntilUnmount } from "@innoai-tech/vuekit";

class Persist<T extends any> {
  static create<T extends any>(name: string) {
    return new Persist<T>(name);
  }

  constructor(private name: string) {}

  store(value: T | null): void {
    if (value) {
      return localStorage.setItem(this.name, JSON.stringify(value));
    } else {
      return localStorage.clear();
    }
  }

  load(): T | null {
    try {
      const s = localStorage.getItem(this.name);
      if (s) {
        return JSON.parse(s);
      }
    } catch (e) {}

    return null;
  }

  clear() {
    return localStorage.removeItem(this.name);
  }
}

export const persist = <T extends any, O extends Observable<T | null>>(
  name: string,
  create: (stored: T | null) => O
) => {
  const p = Persist.create<T>(name);
  const stored = p.load();

  const o$ = create(stored);

  rx(
    o$,
    distinctUntilChanged(),
    subscribeUntilUnmount((value) => {
      p.store(value);
    })
  );

  return o$;
};

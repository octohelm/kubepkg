import { createProvider, rx, component$, render } from "@nodepkg/runtime";
import { Snakebar } from "../Overlays";
import { BehaviorSubject } from "@nodepkg/runtime/rxjs";

export interface Notification extends NotificationOptions {
  msg: string;
}

export interface NotificationOptions {
  autoCloseAfter?: number;
}

class NotificationFactory extends BehaviorSubject<Notification[]> {
  notify(msg: string, opts: NotificationOptions = {}) {
    this.next([
      ...this.value,
      {
        msg,
        autoCloseAfter: opts.autoCloseAfter ?? 3000,
      },
    ]);
  }

  remove(n: Notification) {
    this.next(this.value.filter((x) => x != n));
  }
}

const NotificationProvider = createProvider(
  () => {
    return new NotificationFactory([]);
  },
  {
    name: "Notification",
  }
);

export const useNotify = () => {
  const n = NotificationProvider.use();
  return (msg: string, opts: NotificationOptions = {}) => n.notify(msg, opts);
};

export const NotificationView = component$(() => {
  const ns$ = NotificationProvider.use();

  return rx(
    ns$,
    render((ns) => {
      return (
        <>
          {ns.map((n) => (
            <Snakebar
              onDidClose={() => {
                ns$.remove(n);
              }}
              autoCloseAfter={n.autoCloseAfter}
            >
              {n.msg}
            </Snakebar>
          ))}
        </>
      );
    })
  );
});

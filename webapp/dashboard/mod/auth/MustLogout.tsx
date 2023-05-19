import { TokenProvider } from "./TokenProvider";
import {
  rx,
  t,
  type VNodeChild,
  component$,
  useRoute,
  useRouter
} from "@nodepkg/runtime";
import { tap } from "@nodepkg/runtime/rxjs";

export const MustLogout = component$(
  {
    $default: t.custom<VNodeChild>().optional()
  },
  ({}, { slots, render }) => {
    const token$ = TokenProvider.use();
    const router = useRouter();
    const r = useRoute();

    return rx(
      token$,
      tap((token) => {
        if (token$.validateToken(token?.accessToken)) {
          const query = r.query as { redirect_uri?: string };

          void router.replace(query.redirect_uri ?? "/");
        }
      }),
      render((token) => {
        if (!token$.validateToken(token?.accessToken)) {
          return slots.default?.();
        }
        return null;
      })
    );
  }
);

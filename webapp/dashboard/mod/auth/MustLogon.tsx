import { TokenProvider } from "./TokenProvider";
import { tap } from "@nodepkg/runtime/rxjs";
import { TokenPatchFetcher } from "./TokenPatchFetcher";
import { CurrentUserProvider } from "./CurrentUser";
import { component$, useRoute, useRouter } from "@nodepkg/runtime";
import { rx, t, type VNodeChild } from "@innoai-tech/vuekit";

export const MustLogon = component$({
  $default: t.custom<VNodeChild>().optional(),
},(_, { slots, render }) => {
  const token$ = TokenProvider.use();
  const router = useRouter();
  const r = useRoute();

  return rx(
    token$,
    tap((token) => {
      if (!token$.validateToken(token?.accessToken)) {
        void router.replace({
          path: "/login",
          query: {
            redirect_uri: encodeURIComponent(r.fullPath)
          }
        });
      }
    }),
    render((token) => {
      if (token$.validateToken(token?.accessToken)) {
        return (
          <TokenPatchFetcher>
            <CurrentUserProvider>{slots.default?.()}</CurrentUserProvider>
          </TokenPatchFetcher>
        );
      }
      return null;
    })
  );
});

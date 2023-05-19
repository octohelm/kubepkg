import { component$, useRequest, useRoute, rx } from "@nodepkg/runtime";
import { map } from "@nodepkg/runtime/lodash";
import {
  listAuthProvider,
  authorize
} from "@webapp/dashboard/client/dashboard";
import { onMounted } from "@nodepkg/runtime";

import { FilledButton, Box } from "@nodepkg/ui";
import { Logo } from "@webapp/dashboard/layout";

const useAuthState = () => {
  const r = useRoute();
  return btoa(decodeURIComponent((r.query as { redirect_uri?: string }).redirect_uri ?? "/"));
};

export const LoginCard = component$(({}, { render }) => {
  const listAuthProvider$ = useRequest(listAuthProvider);
  const authorize$ = useRequest(authorize);

  const authState = useAuthState();

  onMounted(() => {
    listAuthProvider$.next();
  });

  return rx(
    listAuthProvider$,
    render((resp) => (
      <Box
        sx={{
          minWidth: 320
        }}
      >
        <Box sx={{ pb: 64, px: 8 }}>
          <Logo />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
          {map(resp?.body, (p) =>
            p.type === "oauth" ? (
              <FilledButton
                key={p.name}
                component={"a"}
                href={authorize$.toHref({ name: p.name, state: authState })}
              >
                通过 {p.name} 登录
              </FilledButton>
            ) : null
          )}
        </Box>
      </Box>
    ))
  );
});

import { exchangeToken } from "@webapp/dashboard/client/dashboard";
import { TokenProvider } from "./TokenProvider";
import {
  onMounted,
  rx,
  subscribeUntilUnmount,
  RouterLink
} from "@nodepkg/runtime";
import {
  component$,
  useRequest,
  useRoute,
  useRouter,
  render
} from "@nodepkg/runtime";
import { Box } from "@nodepkg/ui";

export const AuthProviderCallback = component$(() => {
  const exchangeToken$ = useRequest(exchangeToken);

  const token$ = TokenProvider.use();

  const router = useRouter();
  const r = useRoute();
  const query = r.query as { code: string; state?: string };
  const params = r.params as { name: string };

  const redirectUri = () => {
    try {
      return atob(query.state ?? "");
    } catch (e) {
      return "/";
    }
  };

  rx(
    exchangeToken$,
    subscribeUntilUnmount((resp) => {
      token$.next({
        type: resp.body.type,
        accessToken: resp.body.access_token,
        refreshToken: resp.body.refresh_token ?? "",
        id: resp.body.id ?? ""
      });

      void router.replace(redirectUri());
    })
  );

  onMounted(() => {
    exchangeToken$.next({
      name: params.name,
      body: {
        code: query.code
      }
    });
  });

  const authorizingEl = rx(
    exchangeToken$.requesting$,
    render((requesting) => {
      return requesting ? (
        <Box
          sx={{
            textStyle: "sys.display-small"
          }}
        >
          认证中 ...
        </Box>
      ) : null;
    })
  );

  const errorEl = rx(
    exchangeToken$.error$,
    render((resp) => {
      return (
        <>
          <Box
            sx={{
              color: "sys.error",
              textStyle: "sys.display-small"
            }}
          >
            {resp.error.msg}
          </Box>
          <RouterLink
            to={`/login?redirect_uri=${encodeURIComponent(redirectUri())}`}
          >
            重新登录
          </RouterLink>
        </>
      );
    })
  );

  return () => (
    <Box
      sx={{
        w: "100vw",
        h: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 16
      }}
    >
      {authorizingEl}
      {errorEl}
    </Box>
  );
});

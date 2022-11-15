import { createDomain } from "../../layout";
import { useRequest } from "@innoai-tech/reactutil";
import { exchangeToken } from "../../client/dashboard";
import { map } from "rxjs";
import { isAfter } from "date-fns";

export interface Token {
  id: string;
  type: string;
  accessToken: string;
  refreshToken: string;
}

const validateToken = (tokenStr?: string) => {
  if (tokenStr) {
    try {
      return isAfter(
        (JSON.parse(atob(tokenStr.split(".")[1]!)).exp - 30) * 1000,
        Date.now()
      );
    } catch (_) {}
  }
  return false;
};

export const TokenProvider = createDomain(({}, use) => {
  const exchangeToken$ = useRequest(exchangeToken);

  return use(
    "token",
    {} as Token,
    {
      exchange$: exchangeToken$,
      validateToken,
    },
    (token$) =>
      token$.exchange$.pipe(
        map((resp) => ({
          type: resp.body.type,
          accessToken: resp.body.accessToken,
          refreshToken: resp.body.refreshToken || "",
          id: resp.body.id || "",
        }))
      )
  );
});

// export const useToken$ = TokenProvider.use$;

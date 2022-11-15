import { applyRequestInterceptors, RequestConfig } from "@innoai-tech/fetcher";
import { get, set } from "@innoai-tech/lodash";
import { FetcherProvider, useFetcher } from "@innoai-tech/reactutil";
import { useMemo, ReactNode } from "react";
import { TokenProvider } from "./domain";

export const AuthTokenPatcher = ({ children }: { children: ReactNode }) => {
  const oldFetcher = useFetcher();
  const token$ = TokenProvider.use$();

  const fetcher = useMemo(() => {
    const f = applyRequestInterceptors((requestConfig) => {
      const tok = `Bearer ${token$.value?.accessToken}`;
      set(requestConfig, ["headers", "Authorization"], tok);
      return requestConfig;
    })(oldFetcher);

    return {
      request: <TInputs extends any, TRespData extends any>(
        requestConfig: RequestConfig<TInputs>
      ) => {
        return f.request<TInputs, TRespData>(requestConfig);
      },
      toHref: (requestConfig: RequestConfig<any>) => {
        set(
          requestConfig,
          ["params", "x-param-header-Authorization"],
          get(requestConfig, ["headers", "Authorization"])
        );
        return f.toHref(requestConfig);
      },
    };
  }, [oldFetcher]);

  // TODO add token refresh

  return <FetcherProvider fetcher={fetcher}>{children}</FetcherProvider>;
};

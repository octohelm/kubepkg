import { applyRequestInterceptors, RequestConfig } from "@innoai-tech/fetcher";
import { get, has, set } from "@innoai-tech/lodash";
import { FetcherProvider, useFetcher } from "@nodepkg/state";
import { useMemo, ReactNode } from "react";
import { TokenProvider } from "./domain";


const AuthorizationInQuery = "x-param-header-Authorization";

export const AuthTokenPatcher = ({ children }: { children: ReactNode }) => {
  const oldFetcher = useFetcher();
  const token$ = TokenProvider.use$();

  const fetcher = useMemo(() => {
    const f = applyRequestInterceptors((requestConfig) => {
      const tok = `Bearer ${token$.value?.accessToken}`;
      if (requestConfig.params && has(requestConfig.params, AuthorizationInQuery)) {
        set(requestConfig, ["params", AuthorizationInQuery], tok);
      }
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
        set(requestConfig, ["params", AuthorizationInQuery], null);
        return f.toHref(requestConfig);
      }
    };
  }, [oldFetcher]);

  // TODO add token refresh

  return <FetcherProvider fetcher={fetcher}>{children}</FetcherProvider>;
};

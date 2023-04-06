import { applyRequestInterceptors, type RequestConfig } from "@innoai-tech/fetcher";
import { has } from "@nodepkg/runtime/lodash";
import { FetcherProvider } from "@nodepkg/runtime";
import { component, t, type VNodeChild } from "@nodepkg/runtime";
import { TokenProvider } from "./TokenProvider";

const AuthorizationInQuery = "x-param-header-Authorization";

export const TokenPatchFetcher = component(
  {
    $default: t.custom<VNodeChild>().optional(),
  },
  (_, { slots }) => {
    const token$ = TokenProvider.use();

    const parentFetcher = FetcherProvider.use();

    const f = applyRequestInterceptors((requestConfig) => {
      const Authorization = `Bearer ${token$.value?.accessToken}`;

      return {
        ...requestConfig,
        params: {
          ...requestConfig.params,
          ...(has(requestConfig.params, AuthorizationInQuery)
            ? { [AuthorizationInQuery]: Authorization }
            : {}),
        },
        headers: {
          ...requestConfig.headers,
          Authorization,
        },
      };
    })(parentFetcher);

    const fetcher = {
      request: <TInputs extends any, TRespData extends any>(
        requestConfig: RequestConfig<TInputs>
      ) => f.request<TInputs, TRespData>(requestConfig),

      toHref: (requestConfig: RequestConfig<any>) =>
        f.toHref({
          ...requestConfig,
          params: {
            ...requestConfig.params,
            [AuthorizationInQuery]: "", // mark AuthorizationInQuery to let Interceptor patching
          },
        }),
    };

    return () => {
      return (
        <FetcherProvider value={fetcher}>{slots.default?.()}</FetcherProvider>
      );
    };
  }
);

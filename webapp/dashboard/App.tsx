import { GlobalStyle, CSSReset, ThemeProvider, theming } from "@nodepkg/ui";
import {
  component,
  RouterView,
  applyRequestInterceptors,
  createFetcher,
  ManifestProvider,
  FetcherProvider,
  paramsSerializer,
  transformRequestBody,
} from "@nodepkg/runtime";

// @ts-ignore
import normalizeCss from "normalize.css/normalize.css?raw";

import conf, { CONFIG } from "@webapp/dashboard/config";
import { TokenProvider } from "@webapp/dashboard/mod/auth";

const c = conf();

const fixBaseURL = (baseURL: string) => {
  if (baseURL) {
    if (baseURL.startsWith("//")) {
      return `${location.protocol}${baseURL}`;
    }
    return baseURL;
  }
  return location.origin;
};

export const createDefaultFetcher = () =>
  applyRequestInterceptors((requestConfig) => {
    if (
      !(
        requestConfig.url.startsWith("//") ||
        requestConfig.url.startsWith("http:") ||
        requestConfig.url.startsWith("https://")
      )
    ) {
      requestConfig.url = `${fixBaseURL(c.API_DASHBOARD)}${requestConfig.url}`;
    }

    if (location.protocol.endsWith("s:")) {
      if (!requestConfig.params) {
        requestConfig.params = {};
      }
      requestConfig.params["secure"] = true;
    }

    return requestConfig;
  })(
    createFetcher({
      paramsSerializer,
      transformRequestBody,
    })
  );

export const App = component(() => {
  const fetcher = createDefaultFetcher();

  return () => (
    <ThemeProvider value={theming as any}>
      <ManifestProvider
        value={{
          name: c.name,
          description: CONFIG.manifest["description"],
        }}
      >
        <CSSReset />
        <GlobalStyle styles={normalizeCss} />
        <FetcherProvider value={fetcher}>
          <TokenProvider>
            <RouterView />
          </TokenProvider>
        </FetcherProvider>
      </ManifestProvider>
    </ThemeProvider>
  );
});

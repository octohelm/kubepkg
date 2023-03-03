import { createRoot } from "react-dom/client";
import { ReactNode, useMemo } from "react";
import { App } from "./app/App";
import {
  applyRequestInterceptors,
  createFetcher,
  paramsSerializer,
  transformRequestBody
} from "@innoai-tech/fetcher";
import { FetcherProvider, PlatformProvider, StoreProvider } from "@nodepkg/runtime";
import conf from "./config";
import { BrowserRouter } from "@nodepkg/router";
import { TokenProvider } from "./auth";

const root = createRoot(document.getElementById("root") as any);
const basename = `${document.querySelector("base")?.getAttribute("href")}/`;

const fixBaseURL = (baseURL: string) => {
  if (baseURL) {
    if (baseURL.startsWith("//")) {
      return `${location.protocol}${baseURL}`;
    }
    return baseURL;
  }
  return location.origin;
};

const Bootstrap = ({ children }: { children: ReactNode }) => {
  const c = conf();

  const fetcher = useMemo(
    () =>
      applyRequestInterceptors((requestConfig) => {
        if (
          !(
            requestConfig.url.startsWith("//") ||
            requestConfig.url.startsWith("http:") ||
            requestConfig.url.startsWith("https://")
          )
        ) {
          requestConfig.url = `${fixBaseURL(c.API_DASHBOARD)}${
            requestConfig.url
          }`;
        }

        if (location.protocol.endsWith("s:")) {
          if (!requestConfig.params) {
            requestConfig.params = {};
          }
          requestConfig.params["secure"] = true;
        }

        return requestConfig;
      })(createFetcher({ paramsSerializer, transformRequestBody })),
    []
  );

  return (

    <BrowserRouter basename={basename}>
      <PlatformProvider>
        <FetcherProvider fetcher={fetcher}>
          <StoreProvider name={c.name}>
            <TokenProvider>{children}</TokenProvider>
          </StoreProvider>
        </FetcherProvider>
      </PlatformProvider>
    </BrowserRouter>
  );
};

root.render(
  <Bootstrap>
    <App />
  </Bootstrap>
);

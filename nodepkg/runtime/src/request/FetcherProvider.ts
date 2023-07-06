import { createProvider } from "@innoai-tech/vuekit";
import {
  paramsSerializer,
  transformRequestBody,
  createFetcher,
} from "@innoai-tech/fetcher";

export const FetcherProvider = createProvider(
  () =>
    createFetcher({
      paramsSerializer,
      transformRequestBody,
    }),
  {
    name: "Fetcher",
  },
);

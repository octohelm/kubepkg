import {
  createRequestSubject,
  type RequestConfigCreator,
} from "@innoai-tech/fetcher";
import { FetcherProvider } from "./FetcherProvider";

export const useRequest = <TReq, TRespData>(
  createConfig: RequestConfigCreator<TReq, TRespData>
) => {
  const fetcher = FetcherProvider.use();

  return createRequestSubject<TReq, TRespData, RespError>(
    createConfig,
    fetcher
  );
};

// common error
export interface RespError {
  code: number;
  msg: string;
  desc: string;
  errorFields?: Array<{ field: string; msg: string; in: "string" }>;
}

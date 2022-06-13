import { RequestConfig, RequestConfigCreator } from "@innoai-tech/fetcher";

export const createRequest = <TInputs, TRespData>(
  createConfig: (input: TInputs) => Omit<RequestConfig<TInputs>, "inputs">
) => {
  const create = (inputs: TInputs) => ({ ...createConfig(inputs), inputs });
  return create as RequestConfigCreator<TInputs, TRespData>;
};

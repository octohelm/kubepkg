import type { RequestConfig, RequestConfigCreator } from "@innoai-tech/fetcher";

export const createRequest = <TInputs, TRespData>(
  operationID: string,
  createConfig: (input: TInputs) => Omit<RequestConfig<TInputs>, "inputs">
) => {
  const create = (inputs: TInputs = {} as TInputs) => ({
    ...createConfig(inputs),
    inputs,
  });
  create.operationID = operationID;
  return create as RequestConfigCreator<TInputs, TRespData>;
};

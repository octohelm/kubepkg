import { paramsSerializer } from "@nodepkg/runtime/fetcher";
import {
  type Dictionary,
  filter,
  first,
  isEmpty,
  isUndefined,
  keys,
  map,
  omitBy,
  pick,
  pickBy,
  reduce,
  replace,
} from "@nodepkg/runtime/lodash";

const pickParametersIn =
  (where: string) =>
  (parameters: any[]): any[] =>
    filter(parameters, (parameter: any) => parameter.in === where);

const pickKeysIn =
  (where: string) =>
  (parameters: any[]): string[] =>
    map(
      pickParametersIn(where)(parameters),
      (parameter: any) => parameter.name
    );

const pickDefaults = (where: string, parameters: any[]) =>
  reduce(
    pickParametersIn(where)(parameters),
    (defaults, parameter: any) => ({
      ...defaults,
      [String(parameter.name)]: parameter.default,
    }),
    {}
  );

export const pickValuesIn = (
  where: string,
  parameters: any[],
  values: any
) => ({
  ...pickDefaults(where, parameters),
  ...pick(values, pickKeysIn(where)(parameters)),
});

const mayWithQuery = (queries: Record<string, any>): string => {
  const availableQueries = omitBy(queries, isUndefined);

  if (isEmpty(availableQueries)) {
    return "";
  }

  return `?${paramsSerializer(availableQueries)}`;
};

export const compilePath = (
  path: string,
  params: Dictionary<any> = {}
): string =>
  replace(path, /{([\s\S]+?)}/g, (target: string, key: string) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ([] as string[]).concat(params[key] || target).join(",")
  );

export const buildOriginalUrl = (url: string, queries: Record<string, any>) => {
  const finalQueries = pickBy(queries, (v) => !isEmpty(v));
  return `${url}${mayWithQuery(finalQueries)}`;
};

export const getContentType = (headers: any = {}): string =>
  headers["Content-Type"] || headers["content-type"] || "";

export const isContentTypeMultipartFormData = (headers: any) =>
  getContentType(headers).includes("multipart/form-data");
export const isContentTypeJSON = (headers: any) =>
  getContentType(headers).includes("application/json");
export const isContentTypeFormURLEncoded = (headers: any) =>
  getContentType(headers).includes("application/x-www-form-urlencoded");
export const isContentTypeTextPlain = (headers: any) =>
  getContentType(headers).includes("text/plain");
export const isContentTypeTextHTML = (headers: any) =>
  getContentType(headers).includes("text/html");

export const getHeadContentType = (operation: any) => {
  if (operation.requestBody) {
    return first(keys(operation.requestBody.content)) || "";
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return first<string>(operation.produces || []) || "";
};

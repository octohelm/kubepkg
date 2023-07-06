import {
  assign,
  isArray,
  isObject,
  keys,
  map,
  pick,
  sortBy,
  toUpper,
} from "@nodepkg/runtime/lodash";
import {
  buildOriginalUrl,
  getContentType,
  isContentTypeFormURLEncoded,
  isContentTypeJSON,
  isContentTypeMultipartFormData,
  isContentTypeTextHTML,
} from "./http";
import {
  paramsSerializer,
  type RequestConfig,
  type FetcherResponse,
} from "@nodepkg/runtime/fetcher";
import { Box } from "@nodepkg/ui";
import { component, t, type VNodeChild } from "@nodepkg/runtime";

const getDefaultHeads = (): Record<string, any> => ({
  "User-Agent": navigator.userAgent,
  Origin: location.origin,
  Referer: `${location.origin}${location.pathname}`,
});

const sortObject = (object: any): any => pick(object, sortBy(keys(object)));

interface IHeadRowProps {
  field: string;
  value: string;
}

export const HeadRow = ({ field, value }: IHeadRowProps) => (
  <Box component={"span"} sx={{ display: "block" }}>
    <Box component={"span"} sx={{ fontWeight: "bold", marginRight: "0.5em" }}>
      {field}:
    </Box>
    <span>{value}</span>
  </Box>
);

const HttpFirstLine = ({ method, url, params }: RequestConfig<any>) => (
  <Box component={"span"} sx={{ fontWeight: "bold" }}>
    {toUpper(method)}
    &nbsp;
    <Box component={"span"} sx={{ fontWeight: "medium" }}>
      {buildOriginalUrl(`${url as string}`, params as any)}
    </Box>
    &nbsp; HTTP/1.1
  </Box>
);

const displayMultipart = (boundary: string, data: any) => {
  const getPart = (k: string, v: any): string => {
    if (v instanceof File || v instanceof Blob) {
      return `${boundary}
Content-Disposition: form-data; name="${k}"${
        (v as File).name ? `; filename="${(v as File).name}"` : ""
      }
Content-Type: ${v.type}

[File Content]
`;
    }

    if (isArray(v)) {
      return map(v, (item) => getPart(k, item)).join("\n");
    }

    return `${boundary}
Content-Disposition: form-data; name="${k}"

${isObject(v) ? JSON.stringify(v) : String(v)}
`;
  };

  return (
    map(data, (v: any, k: string) => getPart(k, v)).join("\n") + `${boundary}--`
  );
};

const stringifyBody = (request: RequestConfig<any>) => {
  if (isContentTypeMultipartFormData(request.headers)) {
    const boundary =
      "----WebKitFormBoundaryfakefakefakefakefakefakefakefakefake";

    request.headers = {
      ...request.headers,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    };

    return displayMultipart(boundary, request.body);
  }

  if (isContentTypeFormURLEncoded(request.headers)) {
    return paramsSerializer(request.body);
  }

  if (isContentTypeJSON(request.headers)) {
    return JSON.stringify(request.body, null, 2);
  }

  return request.body;
};

const CodeView = component(
  {
    $default: t.custom<VNodeChild>().optional(),
  },
  ({}, { slots }) => {
    return () => (
      <Box
        sx={{
          width: "100%",
          overflow: "auto",
        }}
      >
        <Box
          component={"pre"}
          sx={{
            padding: 4,
            margin: 0,
            textStyle: "sys.body-small",
            fontFamily: "code",
          }}
        >
          <code>{slots.default?.()}</code>
        </Box>
      </Box>
    );
  },
);

export const HttpRequest = component(
  {
    request: t.custom<RequestConfig<any>>(),
  },
  (props) => {
    return () => {
      const request = props.request;

      return (
        <CodeView>
          <HttpFirstLine {...request} />
          <>
            {map(
              sortObject(assign(getDefaultHeads(), request.headers)),
              (value: string, key: string) => (
                <HeadRow key={key} field={key} value={value} />
              ),
            )}
          </>
          {request.body && (
            <>
              <br />
              {stringifyBody(request)}
            </>
          )}
        </CodeView>
      );
    };
  },
);

// @ts-ignore
const abToString = (buffer: any) => Buffer.from(buffer).toString("utf8");

const toDataURI = (buffer: any, contentType: string) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let len = bytes.byteLength, i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return `data:${contentType};base64,${btoa(binary)}`;
};

export const HTTPResponse = component(
  {
    response: t.custom<FetcherResponse<any, any>>(),
  },
  (props, {}) => {
    return () => {
      const response = props.response;

      if (isContentTypeTextHTML(response.headers)) {
        return (
          <div>
            <img
              src={toDataURI(response.body, getContentType(response.headers))}
              alt={""}
            />
          </div>
        );
      }

      return (
        <CodeView>
          <span>HTTP/1.1 {response.status}</span>
          <br />
          {response.headers && (
            <>
              {map(response.headers, (value: string, key: string) => (
                <HeadRow key={key} field={key} value={value} />
              ))}
            </>
          )}
          <br />
          {response.body
            ? isContentTypeJSON(response.headers)
              ? JSON.stringify(response.body, null, 2)
              : `${abToString(response.body)}`
            : null}
        </CodeView>
      );
    };
  },
);

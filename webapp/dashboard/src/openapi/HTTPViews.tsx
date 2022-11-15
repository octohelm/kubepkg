import { assign, isArray, isObject, keys, map, pick, sortBy, toUpper } from "@innoai-tech/lodash";
import {
  buildOriginalUrl,
  getContentType,
  isContentTypeFormURLEncoded,
  isContentTypeJSON,
  isContentTypeMultipartFormData,
  isContentTypeTextHTML
} from "./http";
import type { ReactNode } from "react";
import { paramsSerializer, RequestConfig, FetcherResponse } from "@innoai-tech/fetcher";
import { Box, useTheme } from "@mui/material";

const getDefaultHeads = (): Record<string, any> => ({
  "User-Agent": navigator.userAgent,
  Origin: location.origin,
  Referer: `${location.origin}${location.pathname}`
});

const sortObject = (object: any): any => pick(object, sortBy(keys(object)));

interface IHeadRowProps {
  field: string;
  value: string;
}

export const HeadRow = ({ field, value }: IHeadRowProps) => (
  <Box component={"span"} sx={{ display: "block" }}>
    <Box component={"span"} sx={{ fontWeight: "bold", marginRight: "0.5em" }}>{field}:</Box>
    <span>{value}</span>
  </Box>
);

const HttpFirstLine = ({ method, url, params }: RequestConfig<any>) => (
  <Box component={"span"} sx={{ fontWeight: "bold" }}>
    {toUpper(method)}
    &nbsp;
    <Box component={"span"} sx={{ fontWeight: "normal" }}>{buildOriginalUrl(`${url as string}`, params as any)}</Box>
    &nbsp;
    HTTP/1.1
  </Box>
);

const displayMultipart = (boundary: string, data: any) => {
  const getPart = (k: string, v: any): string => {
    if (v instanceof File || v instanceof Blob) {
      return `${boundary}
Content-Disposition: form-data; name="${k}"${(v as File).name ? `; filename="${(v as File).name}"` : ""}
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

  return map(data, (v: any, k: string) => getPart(k, v)).join("\n") + `${boundary}--`;
};

const stringifyBody = (request: RequestConfig<any>) => {
  if (isContentTypeMultipartFormData(request.headers)) {
    const boundary = "----WebKitFormBoundaryfakefakefakefakefakefakefakefakefake";

    request.headers = {
      ...request.headers,
      "Content-Type": `multipart/form-data; boundary=${boundary}`
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

const CodeView = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <Box
      component={"pre"}
      sx={{
        px: 2,
        py: 1,
        backgroundColor: theme.palette.grey.A100,
        fontSize: 12,
        maxHeight: 600,
        wordBreak: "keep-all",
        margin: 0,
        fontFamily: "monospace",
        borderRadius: 1,
        overflow: "auto"
      }}
    >
      <code>{children}</code>
    </Box>
  );
};

export const HttpRequest = ({ request }: { request: RequestConfig<any> }) => {
  return (
    <CodeView>
      <HttpFirstLine {...request} />
      <>
        {map(sortObject(assign(getDefaultHeads(), request.headers)), (value: string, key: string) => (
          <HeadRow key={key} field={key} value={value} />
        ))}
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

const abToString = (buffer: any) => Buffer.from(buffer).toString("utf8");

export const transformResponse = (buffer: any, headers?: any) => {
  if (isContentTypeJSON(headers)) {
    return JSON.parse(abToString(buffer));
  }
  return buffer;
};

const toDataURI = (buffer: any, contentType: string) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let len = bytes.byteLength, i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return `data:${contentType};base64,${btoa(binary)}`;
};

export const HTTPResponse = ({ response }: { response: FetcherResponse<any, any> }) => {
  if (isContentTypeTextHTML(response.headers)) {
    const ref = ($el: HTMLIFrameElement) => {
      if ($el) {
        const doc = $el.contentWindow!.document;
        doc.open();
        doc.write(abToString(response.body));
      }
    };
    return <iframe src="about:blank" style={{ width: "100%", minHeight: 400 }} ref={ref} />;
  }

  if (isContentTypeTextHTML(response.headers)) {
    return (
      <div>
        <img src={toDataURI(response.body, getContentType(response.headers))} />
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
      {response.body && (
        <>
          {isContentTypeJSON(response.headers)
            ? JSON.stringify(response.body, null, 2)
            : `${abToString(response.body)}`}
        </>
      )}
    </CodeView>
  );
};

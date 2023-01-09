import { filter, map, reduce, toPairs } from "@innoai-tech/lodash";
import { useMemo } from "react";
import { useOpenAPI } from "./OpenAPI";
import { Box, Button, Stack } from "@mui/material";
import { SchemaView } from "./SchemaView";
import { MonacoEditor, useEpics } from "../layout";
import { Subscribe, useRequest, useStateSubject } from "@innoai-tech/reactutil";
import { HttpRequest, HTTPResponse } from "./HTTPViews";
import type { FetcherResponse, RequestConfig } from "@innoai-tech/fetcher";
import { compilePath, getHeadContentType, pickValuesIn } from "./http";
import { merge } from "rxjs";

export const RequestBuilder = ({ operation }: { operation: any }) => {
  const openapi = useOpenAPI();

  const [requestSchema, toRequest] = useMemo(() => {
    const parameters = [
      ...(operation.parameters || []),
      ...(operation.requestBody
        ? [
            {
              in: "body",
              name: "body",
              required: operation.requestBody.required,
              schema: (([ct, mt]: any[]) => ({
                ...mt?.schema,
                "x-content-type": ct,
              }))(toPairs(operation.requestBody.content)[0] || []),
            },
          ]
        : []),
    ];

    const pickNamesBy = (by: (p: any) => boolean) =>
      map(filter(parameters, by), (p) => p.name);

    return [
      {
        type: "object",
        required: pickNamesBy((p) => p.required),
        properties: reduce(
          parameters,
          (props, p) => {
            return {
              ...props,
              [p.name]: {
                ...p.schema,
                "x-param-in": p.in,
              },
            };
          },
          {}
        ),
        "x-id": "RequestParameter",
      },

      (inputs: any): RequestConfig<any> => {
        const c: RequestConfig<any> = {
          inputs: inputs,
          method: operation.method,
          url: `${operation.basePath || ""}${compilePath(
            operation.path,
            pickValuesIn("path", parameters, inputs)
          )}`,
          params: pickValuesIn("query", parameters, inputs),
          headers: pickValuesIn("headers", parameters, inputs),
          body: inputs.body,
        };

        const contentType = getHeadContentType(operation) || "application/json";

        if (c.body) {
          c.headers = {
            ...c.headers,
            "Content-Type": contentType + "; charset=UTF-8",
          };
        }

        return c;
      },
    ];
  }, [operation]);

  const inputs$ = useStateSubject({});
  const resp$ = useStateSubject({} as FetcherResponse<any, any>);

  const request$ = useRequest(toRequest as any);

  useEpics(resp$, () => merge(request$, request$.error$));

  return (
    <Stack
      spacing={1}
      sx={{ justifyContent: "stretch", width: "100%", position: "relative" }}
    >
      <Stack direction={"row"} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <MonacoEditor
            sx={{ height: "400px" }}
            options={{
              scrollBeyondLastLine: false,
              minimap: { enabled: false },
              theme: "vs-dark",
            }}
            language={"json"}
            path={`${operation.operationID}.RequestParameter.json`}
            defaultValue={"{}"}
            onChange={(value) => {
              if (value) {
                try {
                  inputs$.next(JSON.parse(value));
                } catch (e) {}
              }
            }}
            beforeMount={(monaco) => {
              const schemas = map(
                {
                  ...openapi.components.schemas,
                  RequestParameter: requestSchema,
                },
                (s, k) => {
                  const basePath = operation.basePath || "https://localhost";

                  return {
                    uri: `${basePath}/${k}`,
                    schema: JSON.parse(
                      JSON.stringify(s).replaceAll(
                        "#/components/schemas/",
                        `${basePath}/`
                      )
                    ),
                    fileMatch:
                      k == "RequestParameter"
                        ? ["*.RequestParameter.json"]
                        : [],
                  };
                }
              );

              monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                schemas: schemas,
              });
            }}
          />
        </Box>
        <Box sx={{ flex: 1, overflowX: "auto" }}>
          <SchemaView schema={requestSchema} />
        </Box>
      </Stack>
      <Subscribe value$={inputs$}>
        {(values) => <HttpRequest request={toRequest(values)} />}
      </Subscribe>
      <Subscribe value$={request$.requesting$}>
        {(requesting) => (
          <Box>
            <Button
              disabled={requesting}
              variant={"contained"}
              onClick={() => {
                request$.next(inputs$.value);
              }}
            >
              {requesting ? "请求中..." : "发起请求"}
            </Button>
          </Box>
        )}
      </Subscribe>
      <Subscribe value$={resp$}>
        {(resp) =>
          resp.status ? <HTTPResponse response={resp as any} /> : null
        }
      </Subscribe>
    </Stack>
  );
};

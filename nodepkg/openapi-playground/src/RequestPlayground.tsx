import {
  alpha,
  Box,
  Divider,
  IconButton,
  IconButtonProps,
  IconButtonTypeMap,
  Paper,
  Stack,
  Tooltip
} from "@mui/material";
import { PlayCircle } from "@mui/icons-material";
import { forwardRef, useMemo } from "react";
import {
  Subscribe,
  useStateSubject,
  useObservableEffect,
  useRequest,
  StateSubject
} from "@innoai-tech/reactutil";
import {
  distinctUntilChanged,
  map as rxMap,
  merge,
  tap,
  firstValueFrom
} from "rxjs";
import { useOpenAPI } from "./OpenAPI";
import {
  last,
  map,
  filter,
  get,
  isEqual,
  mapValues,
  reduce,
  toPairs,
  keys,
  take
} from "@innoai-tech/lodash";
import {
  RequestSchemaProvider,
  RequestSchemaView,
  TypeLink
} from "./RequestSchemaView";
import {
  EditorContextProvider,
  useJSONEditor,
  useExtension,
  keymap,
  EditorView,
  forceLinting,
  diagnosticCount,
  selectionSetAt,
  SchemaLSP,
  EditorContainer
} from "@nodepkg/codemirror";
import { cleanupSchema } from "./utils";
import { compilePath, getHeadContentType, pickValuesIn } from "./http";
import type { FetcherResponse, RequestConfig } from "@innoai-tech/fetcher";
import { HttpRequest, HTTPResponse } from "./HTTPViews";
import { Markdown } from "@nodepkg/markdown";
import { usePlatform } from "@nodepkg/state";

export const IconButtonWithTooltip = forwardRef(
  <
    D extends React.ElementType = IconButtonTypeMap["defaultComponent"],
    P extends {} = {}
  >(
    {
      title,
      disabled,
      children,
      ...props
    }: IconButtonProps<D, P & { title: string }>,
    ref: any
  ) => {
    return (
      <Tooltip title={title}>
        <IconButton
          ref={ref}
          size="normal"
          disabled={disabled}
          aria-label={title}
          {...props}
        >
          {children}
        </IconButton>
      </Tooltip>
    );
  }
);

export const RequestPlayground = () => {
  const openapi = useOpenAPI();

  const schema = useMemo(() => {
    return cleanupSchema({
      anyOf: map(openapi.operations, (operation, k) => ({
        properties: {
          [k]: {
            $ref: `#/definitions/${k}`,
            description: operation.summary
          }
        },
        required: [k],
        additionalProperties: false,
        type: "object"
      })),
      definitions: {
        ...openapi.components.schemas,
        ...mapValues(openapi.operations, (operation) => {
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
                    "x-content-type": ct
                  }))(toPairs(operation.requestBody.content)[0] || [])
                }
              ]
              : [])
          ];

          const pickNamesBy = (by: (p: any) => boolean) =>
            map(filter(parameters, by), (p) => p.name);

          return {
            "x-id": operation.operationId,
            type: "object",
            description: [operation.summary, operation.description]
              .filter((v) => v)
              .join("\n\n"),
            "x-method": operation.method.toUpperCase(),
            "x-path": operation.path,
            required: pickNamesBy((p) => p.required),
            additionalProperties: false,
            properties: {
              ...reduce(
                parameters,
                (props, p) => ({
                  ...props,
                  [p.name]: {
                    ...p.schema,
                    "x-param-in": p.in
                  }
                }),
                {}
              ),
              "__responses": {
                type: "object",
                description: "请求返回",
                properties: mapValues(operation.responses, ({ content }) => {
                  const contentTypes = keys(content || {});

                  if (contentTypes.length) {
                    return {
                      ...content[contentTypes[0]!].schema,
                      "x-content-type": contentTypes[0]
                    };
                  }

                  return {};
                })
              }
            }
          };
        })
      }
    });
  }, [openapi]);

  return (
    <EditorContextProvider doc={JSON.stringify({}, null, 2)}>
      <Playground schema={schema} />
    </EditorContextProvider>
  );
};

const Playground = ({ schema }: { schema: any }) => {
  const openapi = useOpenAPI();

  useJSONEditor(schema);

  const schemaBreadcrumbs$ = useStateSubject([schema]);

  const request$ = useRequest(((o: any) => {
    const operationID = keys(o)[0]!;
    const inputs = o[operationID];

    const operation = get(openapi, ["operations", operationID]);

    const c: RequestConfig<any> = {
      inputs: inputs,
      method: operation.method,
      url: `${operation.basePath || ""}${compilePath(
        operation.path,
        pickValuesIn("path", operation.parameters, inputs)
      )}`,
      params: pickValuesIn("query", operation.parameters, inputs),
      headers: pickValuesIn("headers", operation.parameters, inputs),
      body: inputs.body
    };

    const contentType = getHeadContentType(operation) || "application/json";

    if (c.body) {
      c.headers = {
        ...c.headers,
        "Content-Type": contentType + "; charset=UTF-8"
      };
    }

    return c;
  }) as any);

  const resp$ = useStateSubject({} as FetcherResponse<any, any>);

  useObservableEffect(() =>
    merge(request$, request$.error$).pipe(tap(resp$.next))
  );

  return (
    <Stack
      direction={"row"}
      sx={(t) => ({
        justifyContent: "stretch",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        px: 1,
        py: 2,
        position: "relative",
        backgroundColor: t.palette.background.paper
      })}
    >
      <Documents schema={schema} schemaBreadcrumbs$={schemaBreadcrumbs$} />
      <Box
        sx={{
          overflow: "hidden",
          flex: 1,
          px: 2,
          py: 4
        }}
      >
        <Stack
          direction={"row"}
          justifyContent={"stretch"}
          sx={(t) => ({
            width: "100%",
            height: "100%",
            position: "relative",
            padding: 1,
            borderRadius: 5,
            backgroundColor: alpha(t.palette.divider, 0.05)
          })}
        >
          <Paper
            sx={{
              width: "50%",
              px: 2,
              py: 4,
              borderRadius: 5
            }}
          >
            <Stack
              direction={"row-reverse"}
              spacing={2}
              justifyContent={"stretch"}
              sx={{ height: "100%" }}
            >
              <Box>
                <RequestSubmit request$={request$} />
              </Box>
              <Box sx={{ flex: 1, height: "100%" }}>
                <EditorContainer />
              </Box>
            </Stack>
          </Paper>
          <Box
            sx={{
              width: "50%",
              height: "100%",
              overflowX: "hidden",
              overflowY: "auto",
              padding: 2
            }}
          >
            <Subscribe value$={resp$}>
              {(response) =>
                response.config ? (
                  <>
                    <HttpRequest request={response.config} />
                    <Divider />
                    <HTTPResponse response={response} />
                  </>
                ) : (
                  <Tips />
                )
              }
            </Subscribe>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};

const Tips = () => {
  const p = usePlatform();

  return (
    <Box sx={{ padding: 2, fontSize: 14 }}>
      <Markdown>
        {`
通过 JSON 构造请求参数

\`\`\`json
{
   "{OperationID}": {
      ...{OperationParameters}
   }
}
\`\`\`

快捷键
* \`${p.os.mac ? "CMD" : "Ctrl"} + Enter\`：发起请求
* \`Shirt + Space\`：自动补全提示

                    `}
      </Markdown>
    </Box>
  );
};

const RequestSubmit = ({
                         request$
                       }: {
  request$: ReturnType<typeof useRequest>;
}) => {
  const ctx = EditorContextProvider.use();
  const p = usePlatform();

  const { execute } = useMemo(
    () => ({
      execute: (view: EditorView): boolean => {
        forceLinting(view);

        setTimeout(() => {
          if (diagnosticCount(view.state) === 0) {
            request$.next(JSON.parse(view.state.doc.sliceString(0)));
          }
        });

        return true;
      }
    }),
    []
  );

  useExtension(() => [
    keymap.of([
      {
        key: `${p.os.mac ? "Cmd" : "Ctrl"}-Enter`,
        run: execute
      }
    ])
  ]);

  return (
    <Subscribe value$={request$.requesting$}>
      {(requesting) => (
        <IconButtonWithTooltip
          disabled={requesting}
          title={`请求 (${p.os.mac ? "Cmd" : "Ctrl"} + Enter)`}
          onClick={async () => {
            const view = await firstValueFrom(ctx.view$);
            view && execute(view);
          }}
        >
          <PlayCircle />
        </IconButtonWithTooltip>
      )}
    </Subscribe>
  );
};

export const Documents = ({
                            schema,
                            schemaBreadcrumbs$
                          }: {
  schema: any;
  schemaBreadcrumbs$: StateSubject<any[]>;
}) => {
  const selectionSet$ = useStateSubject([] as string[]);

  useObservableEffect(() => {
    const lsp = new SchemaLSP(schema);

    return selectionSet$.pipe(
      distinctUntilChanged(isEqual),
      rxMap((selection) => {
        let schemaBreadcrumbs = lsp.resolve(selection);
        if (schemaBreadcrumbs.length === 1) {
          return schemaBreadcrumbs;
        }
        if (last(schemaBreadcrumbs)?.type !== "object") {
          schemaBreadcrumbs = take(
            schemaBreadcrumbs,
            schemaBreadcrumbs.length - 1
          );
        }
        return schemaBreadcrumbs;
      }),
      tap(schemaBreadcrumbs$)
    );
  }, [schema]);

  useExtension(() =>
    EditorView.updateListener.of((u) => {
      selectionSet$.next(
        selectionSetAt(u.state, u.state.selection.main.head).selection
      );
    })
  );

  return (
    <Stack
      sx={{
        width: "24vw",
        maxWidth: "320px"
      }}
    >
      <Subscribe value$={schemaBreadcrumbs$}>
        {(schemaBreadcrumbs) => (
          <RequestSchemaProvider
            rootSchema={schema}
            schemaBreadcrumbs$={schemaBreadcrumbs$}
          >
            <Stack
              direction={"row"}
              alignItems={"center"}
              sx={{
                fontSize: "13px",
                fontFamily: "monospace",
                px: 1
              }}
            >
              {map(schemaBreadcrumbs, (schema, i) => (
                <Stack direction={"row"} alignItems={"center"} key={i}>
                  {i > 0 && <Box sx={{ opacity: 0.5, mx: 1 }}>/</Box>}
                  <TypeLink
                    sx={{
                      opacity: i < schemaBreadcrumbs.length - 1 ? 0.5 : 1
                    }}
                    onClick={() =>
                      schemaBreadcrumbs$.next((schemaBreadcrumbs) =>
                        schemaBreadcrumbs.slice(0, i + 1)
                      )
                    }
                  >
                    {schema["x-id"] || "#"}
                  </TypeLink>
                </Stack>
              ))}
            </Stack>
            <Box
              sx={{
                flex: 1,
                py: 2,
                px: 2,
                width: "100%",
                height: "100%",
                overflow: "auto"
              }}
            >
              <RequestSchemaView schema={last(schemaBreadcrumbs)} />
            </Box>
          </RequestSchemaProvider>
        )}
      </Subscribe>
    </Stack>
  );
};

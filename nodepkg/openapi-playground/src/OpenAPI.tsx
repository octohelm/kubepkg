import { createContext, ReactNode, useContext, useState } from "react";
import { from } from "rxjs";
import { tap } from "rxjs/operators";
import { forEach, last, split, startsWith } from "@innoai-tech/lodash";
import { useFetcher, useObservableEffect } from "@innoai-tech/reactutil";
import { Box } from "@mui/material";

const OpenAPIContext = createContext({ openapi: {} as any, operationID: "" });

export const useOpenAPI = () => useContext(OpenAPIContext).openapi;

export const ErrorInfo = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      display: "flex",
      fontSize: "2em",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <span>{children}</span>
  </Box>
);

const operationsIgnored = ["OpenAPI"];

const patchOpenAPI = (openapi: any, basePath: string) => {
  const operations: any = {};

  forEach(openapi.paths, (methods, path) => {
    forEach(methods, (op, method) => {
      if (operationsIgnored.includes(op.operationId)) {
        return;
      }

      operations[op.operationId] = {
        ...op,
        method,
        path,
        basePath: basePath,
        group: last(split(op.tags[0], "/pkg/"))
      };
    });
  });

  openapi.operations = operations;
  openapi.servers = [{ url: basePath }];

  return openapi;
};

export const OpenAPIProvider = ({
                                  children,
                                  operationID,
                                  specPath
                                }: {
  children: ReactNode;
  operationID: string;
  specPath: string;
}) => {
  const fetcher = useFetcher();
  const [openapi, updateOpenapi] = useState({} as any);

  useObservableEffect(
    () =>
      from(fetcher.request({
        method: "GET",
        url: specPath,
        inputs: {}
      })).pipe(
        tap((resp) => {
          const u = new URL(specPath);
          if ((resp.body || {} as any)["paths"]) {
            updateOpenapi(patchOpenAPI(resp.body, u.origin));
          }
        })
      ),
    [specPath]
  );

  if (openapi.version && !startsWith(openapi.version, "3")) {
    return <ErrorInfo>OpenAPI Version Only Support 3.x</ErrorInfo>;
  }

  if (!openapi.operations) {
    return null;
  }

  return (
    <OpenAPIContext.Provider value={{ openapi: openapi, operationID }}>
      {children}
    </OpenAPIContext.Provider>
  );
};

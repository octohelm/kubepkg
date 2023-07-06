import { forEach, last, split, startsWith } from "@nodepkg/runtime/lodash";
import { styled } from "@nodepkg/ui";
import { observableRef } from "@nodepkg/runtime";
import {
  component$,
  t,
  rx,
  FetcherProvider,
  subscribeOnMountedUntilUnmount,
} from "@nodepkg/runtime";

import { filter, switchMap, from } from "@nodepkg/runtime/rxjs";
import { type OpenAPI } from "./OpenAPITypes";
import { RequestPlayground } from "./RequestPlayground";

export const ErrorInfo = styled("div")({
  display: "flex",
  fontSize: "2em",
  alignItems: "center",
  justifyContent: "center",
});

const operationsIgnored = ["OpenAPI"];

const patchOpenAPI = (openapi: any, basePath: string): OpenAPI => {
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
        group: last(split(op.tags[0], "/pkg/")),
      };
    });
  });

  openapi.servers = [{ url: basePath }];
  openapi.operations = operations;

  return openapi;
};

export const OpenAPIPlayground = component$(
  {
    spec: t.string(),
  },
  (props, {}) => {
    const fetcher = FetcherProvider.use();
    const openapi = observableRef({} as any);

    rx(
      props.spec$,
      filter((spec) => !!spec),
      switchMap((spec) =>
        from(
          fetcher.request({
            method: "GET",
            url: spec,
            inputs: {},
          }),
        ),
      ),
      subscribeOnMountedUntilUnmount({
        next: (resp) => {
          const u = new URL(props.spec);
          openapi.next(patchOpenAPI(resp.body as any, u.origin));
        },
        error: (err) => {
          console.log(err);
        },
      }),
    );

    return () => {
      if (openapi.value.version && !startsWith(openapi.value.version, "3")) {
        return <ErrorInfo>OpenAPI Version Only Support 3.x</ErrorInfo>;
      }

      if (!openapi.value.operations) {
        return null;
      }

      console.log(openapi.value);

      return <RequestPlayground key={props.spec} openapi={openapi.value} />;
    };
  },
);

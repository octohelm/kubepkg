import { lazy } from "react";
import { path } from "@nodepkg/router";

const PageOpenAPI = lazy(() => import("./PageOpenAPI"));

export const openapiRoutes = path("openapi")
  .root(true)
  .element(<PageOpenAPI />)();

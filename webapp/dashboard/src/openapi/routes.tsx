import { path } from "../layout";
import PageOpenAPI from "./PageOpenAPI";

export const openapiRoutes = path("openapi")
  .root(true)
  .element(<PageOpenAPI />)();

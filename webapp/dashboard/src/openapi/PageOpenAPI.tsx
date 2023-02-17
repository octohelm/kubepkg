import { parseSearch } from "@innoai-tech/fetcher";
import { get } from "@innoai-tech/lodash";
import { useLocation } from "@nodepkg/router";
import {
  RequestPlayground,
  ErrorInfo,
  OpenAPIProvider,
} from "@nodepkg/openapi-playground";

const PageOpenAPI = () => {
  const location = useLocation();
  const query = parseSearch(location.search) as any;

  if (!query.spec) {
    return <ErrorInfo>Missing `spec`</ErrorInfo>;
  }

  const operationID = get(query, ["operationID", 0]);

  return (
    <OpenAPIProvider specPath={query.spec[0]!} operationID={operationID}>
      <RequestPlayground />
    </OpenAPIProvider>
  );
};

export default PageOpenAPI;

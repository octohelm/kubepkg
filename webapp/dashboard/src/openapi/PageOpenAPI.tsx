import { parseSearch } from "@innoai-tech/fetcher";
import { get } from "@innoai-tech/lodash";
import { Stack } from "@mui/material";
import { useLocation } from "react-router-dom";
import { ErrorInfo, OpenAPIProvider } from "./OpenAPI";
import { OperationNav } from "./OperationNav";
import { OperationView } from "./OperationView";

const PageOpenAPI = () => {
  const location = useLocation();

  const query = parseSearch(location.search) as any;

  if (!query.spec) {
    return <ErrorInfo>Missing `spec`</ErrorInfo>;
  }

  const operationID = get(query, ["operationID", 0]);

  return (
    <OpenAPIProvider specPath={query.spec[0]!} operationID={operationID}>
      <Stack direction={"row"} sx={{ overflow: "hidden", height: "100vh" }}>
        <OperationNav />
        <OperationView operationID={operationID} />
      </Stack>
    </OpenAPIProvider>
  );
};

export default PageOpenAPI;

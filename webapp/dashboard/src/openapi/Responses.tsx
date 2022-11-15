import { get, map, replace, sortBy } from "@innoai-tech/lodash";
import { HttpCode } from "./Elements";
import { SchemaView } from "./SchemaView";
import { useOpenAPI } from "./OpenAPI";
import { Box, Stack } from "@mui/material";

interface IResponseItemProps {
  code: number;
  response: any;
}

const reStatusError = /@StatusErr\[(.+)]\[(.+)]\[(.+)](!)?/;

interface IStatusError {
  name: string;
  code: number;
  msg: string;
  canBeTalkError: boolean;
}

const pickHttpError = (list: string[] = []): IStatusError[] => {
  return map(list, (s) => {
    const values = reStatusError.exec(s);

    if (values != null) {
      return {
        code: parseInt(values[2] || "0", 10),
        name: values[1] || "",
        msg: values[3] || "",
        canBeTalkError: !!values[4]
      };
    }

    return ({} as any) as IStatusError;
  });
};

const dropHttpError = (s = ""): string => replace(s, new RegExp(reStatusError, "g"), "");

const HttpErrorList = ({ httpErrorList }: { httpErrorList: IStatusError[] }): JSX.Element => (
  <Box>
    {map(sortBy(httpErrorList, "name"), (httpError, idx) => (
      <Box key={idx}>
        <Stack
          direction={"row"}
          spacing={2}
          sx={{
            alignItems: "center",
            fontWeight: "bold",
            textDecoration: httpError.canBeTalkError ? "underline" : "none"
          }}>
          {httpError.name}
          <Box
            component={"small"}
            sx={{
              opacity: 0.8,
              fontWeight: "bold",
              ml: 1
            }}>
            {httpError.code}
          </Box>
        </Stack>
        <Box component={"small"} sx={{ display: "block" }}>
          {httpError.msg}
        </Box>
      </Box>
    ))}
  </Box>
);

const ResponseItem = ({ code, response }: IResponseItemProps) => {
  const httpErrorList = pickHttpError(response["x-status-errors"]);

  return (
    <>
      <Stack direction={"row"} sx={{ py: 2 }} spacing={5}>
        <Box sx={{ flex: 1, display: "flex", alignItems: "flex-start" }}>
          <Box>
            <HttpCode code={code} />
          </Box>
          <Box sx={{ flex: 1, marginLeft: "0.5em" }}>
            <Box>{dropHttpError(response.description)}</Box>
            <HttpErrorList httpErrorList={httpErrorList} />
          </Box>
        </Box>
        <Box sx={{ width: "70%" }}>
          {!!response.content &&
            map(response.content, (mediaType: any, contentType: string) => (
              <Box
                key={contentType}
                sx={{
                  position: "relative"
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    opacity: 0.3,
                    fontFamily: "monospace",
                    textAlign: "right"
                  }}
                >
                  <Box component={"small"}>
                    Content-Type
                  </Box>
                  <Box>
                    {contentType}
                  </Box>
                </Box>
                <SchemaView schema={mediaType.schema!} />
              </Box>
            ))}
        </Box>
      </Stack>
    </>
  );
};

export const Responses = ({ operation }: { operation: any }) => {
  const openapi = useOpenAPI();

  return (
    <Box>
      {map(operation.responses, (response, code: number) => {
        if (response.$ref) {
          const path = replace(response.$ref, "#/", "").split("/");
          return <ResponseItem key={code} code={code} response={get(openapi, path)} />;
        }
        return <ResponseItem key={code} code={code} response={response} />;
      })}
    </Box>
  );
};

import { useOpenAPI } from "./OpenAPI";
import { getMethodColor } from "./Colors";
import { Section } from "./Elements";
import { Box, ListItem, ListItemText, Stack } from "@mui/material";
import { Markdown } from "./Markdown";
import { Responses } from "./Responses";
import { RequestBuilder } from "./RequestBuilder";

export const OperationView = ({ operationID }: { operationID: string }) => {
  const { operations } = useOpenAPI();
  const op = operations[operationID];

  if (!op) {
    return null;
  }

  return (
    <Stack sx={{ width: "100%" }}>
      <ListItem sx={{
        color: "white",
        backgroundColor: getMethodColor(op.method)
      }}>
        <ListItemText
          primary={
            <Box component={"span"}>
              <Box component={"span"} sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
                {op.operationId}&nbsp;
              </Box>
              <Box component={"small"} sx={{ opacity: 0.8 }}>{op.summary}</Box>
            </Box>
          }
          secondary={
            <Box component="span" sx={{ fontFamily: "monospace", color: "white" }}>
              <span>{String(op.method).toUpperCase()}&nbsp;</span>
              <span>{op.path}</span>
            </Box>
          }
        />
      </ListItem>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {op.description && (
          <Section>
            <Markdown>
              {op.description}
            </Markdown>
          </Section>
        )}
        <Section title={"Request"}>
          <Box sx={{
            padding: [0.6, 1]
          }}>
            <RequestBuilder operation={op} key={op.operationId} />
          </Box>
        </Section>
        <Section title={"Responses"}>
          <Responses operation={op} />
        </Section>
      </Box>
    </Stack>
  );
};

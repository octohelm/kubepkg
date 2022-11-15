import { useMemo } from "react";
import { useOpenAPI } from "./OpenAPI";
import { filter, get, groupBy, map } from "@innoai-tech/lodash";
import { HTTPMethod } from "./Elements";
import {
  Box,
  Input,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Stack,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { parseSearch, stringifySearch } from "@innoai-tech/fetcher";
import { useObservable, useStateSubject } from "@innoai-tech/reactutil";
import { useTheme } from "@mui/material";

const StyledOperationDesc = ({
  deprecated,
  ...otherProps
}: React.HTMLAttributes<any> & {
  deprecated?: boolean;
}) => (
  <Box
    {...otherProps}
    component={"span"}
    sx={{
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      textDecoration: deprecated ? "line-through" : "none",
    }}
  />
);

const GroupedOperationList = ({
  group,
  operations,
}: {
  group: string;
  operations: any[];
}) => {
  const location = useLocation();
  const q = parseSearch(location.search);

  return (
    <>
      <ListSubheader
        sx={{
          opacity: 0.7,
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {group}
      </ListSubheader>
      {map(operations, (operation, key: string) => (
        <ListItem
          key={key}
          component={Link}
          to={{
            search: stringifySearch({
              ...q,
              operationID: operation.operationId,
            }),
          }}
          selected={get(q, ["operationID", 0]) === operation.operationId}
          sx={{
            color: "inherit",
          }}
        >
          <ListItemAvatar>
            <HTTPMethod method={operation.method} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <StyledOperationDesc deprecated={operation.deprecated}>
                <Box sx={{ fontSize: "0.8em" }}>{operation.operationId}</Box>
                <Box sx={{ fontSize: "0.6em", opacity: 0.7 }}>
                  {operation.summary}
                </Box>
              </StyledOperationDesc>
            }
          />
        </ListItem>
      ))}
    </>
  );
};

export const OperationNav = () => {
  const theme = useTheme();

  const filterValue$ = useStateSubject("");
  const { operations } = useOpenAPI();

  const filterValue = useObservable(filterValue$);

  const groupedOperations = useMemo(() => {
    const finalOperations = filterValue
      ? filter(operations, (k) =>
          String(k.operationId || "").includes(filterValue)
        )
      : operations;

    return groupBy(finalOperations, (o) => o.group);
  }, [operations, filterValue]);

  return (
    <Stack
      sx={{
        width: "20vw",
        height: "100%",
        borderRight: "1px solid",
        borderColor: theme.palette.divider,
        "& a": {
          textDecoration: "none",
        },
      }}
    >
      <Box>
        <Input
          placeholder={`输入 Operation ID 筛选`}
          fullWidth
          sx={{
            px: 2,
            py: 1,
            color: "inherit",
          }}
          value={filterValue}
          onChange={(e) => filterValue$.next(e.target.value)}
        />
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <List>
          {map(groupedOperations, (operations: any[], group: string) => (
            <GroupedOperationList
              key={group}
              group={group}
              operations={operations}
            />
          ))}
        </List>
      </Box>
    </Stack>
  );
};

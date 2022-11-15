import {
  forEach,
  get,
  has,
  includes,
  isEmpty,
  isObject,
  isUndefined,
  keys,
  map,
  replace,
  some,
  sortBy,
} from "@innoai-tech/lodash";
import { Box, Stack, Tooltip, useTheme } from "@mui/material";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { deRefs, isArraySchema, isObjectSchema } from "./deRefs";
import { Markdown } from "./Markdown";
import { useOpenAPI } from "./OpenAPI";

interface IOption<T> {
  label: string;
  value: T;
}

export const toEnumMap = (schema: any) => {
  const enumMap: { [key: string]: string } = {};

  forEach(schema.enum, (value, i) => {
    enumMap[value] = get(
      schema,
      ["x-enum-options", i, "label"],
      get(schema, ["x-enum-labels", i], value)
    );
  });

  return enumMap;
};

export const enumToOptions = <T extends any>(
  list: T[],
  enumMap: { [key: string]: string }
): Array<IOption<T>> =>
  map(list, (value) => ({
    label: `${String((enumMap as any)[value]) || " "} ${String(value)}`,
    value,
  }));

const Type = ({
  type,
  format,
  id,
}: {
  type: string;
  format: string;
  id?: string;
}) => {
  const location = useLocation();
  const theme = useTheme();

  if (type === "circular" && id) {
    return (
      <a href={`${location.pathname}${location.search}#~${id}`}>
        <Box
          component={"small"}
          sx={{ opacity: 0.6, fontWeight: "normal" }}
        >{`~${id}`}</Box>
      </a>
    );
  }

  if (id == "-") {
    return null;
  }

  return (
    <Box
      component={"span"}
      id={id ? `~${id}` : undefined}
      sx={
        id && location.hash === `#~${id}`
          ? {
              color: theme.palette.primary.contrastText,
              backgroundColor: theme.palette.primary.main,
              px: 0.5,
              borderRadius: 1,
            }
          : {}
      }
    >
      {type || "any"}
      {(format || id) && (
        <Box
          component={"small"}
          sx={{ opacity: 0.6, fontWeight: "normal" }}
        >{`<${[id, format].filter((v) => v).join(",")}>`}</Box>
      )}
    </Box>
  );
};

export const displayType = (schema: any, id?: string) => {
  if (schema.type === "array" && schema.items) {
    return (
      <span>
        <span>{`[${String(
          schema.minItems && schema.minItems === schema.maxItems
            ? schema.minItems
            : ""
        )}]`}</span>
        {displayType(schema.items, id || schema["x-id"])}
      </span>
    );
  }
  return (
    <Type
      type={schema.type as string}
      format={schema.format || ""}
      id={schema["x-id"] || id}
    />
  );
};

export interface IValidatedSchema {
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
}

const hasValidate = (schema: any) => {
  return some(
    [
      "maximum",
      "exclusiveMaximum",
      "minimum",
      "exclusiveMinimum",
      "maxLength",
      "minLength",
      "pattern",
      "maxItems",
      "minItems",
      "maxProperties",
      "minProperties",
    ] as Array<keyof IValidatedSchema>,
    (key) => has(schema, key)
  );
};

export const getMax = (schema: any): string => {
  if (has(schema, "maxProperties")) {
    return schema.maxProperties;
  }
  if (has(schema, "maxItems")) {
    return schema.maxItems;
  }
  if (has(schema, "maximum")) {
    return schema.maximum;
  }
  if (has(schema, "maxLength")) {
    return schema.maxLength;
  }

  if (schema.type === "string" && schema.format === "uint64") {
    return "19";
  }

  if (
    (schema.type === "number" || schema.type === "integer") &&
    schema.format
  ) {
    return `${
      Math.pow(2, Number(replace(schema.format, /[^0-9]/g, "")) - 1) - 1
    }`;
  }

  return "+∞";
};

export const getMin = (schema: any): string => {
  if (has(schema, "minProperties")) {
    return schema.minProperties;
  }
  if (has(schema, "minItems")) {
    return schema.minItems;
  }
  if (has(schema, "minimum")) {
    return schema.minimum;
  }
  if (has(schema, "minLength")) {
    return schema.minLength;
  }

  if (schema.type === "string") {
    return "0";
  }

  if (
    (schema.type === "number" || schema.type === "integer") &&
    schema.format
  ) {
    return `${
      Math.pow(2, Number(replace(schema.format, /[^0-9]/g, "")) - 1) - 1
    }`;
  }
  return "-∞";
};

export const displayDefault = (schema: any): string => {
  if (isUndefined(schema.default)) {
    return "";
  }

  const defaultValue: string =
    schema.type === "string" ? JSON.stringify(schema.default) : schema.default;

  return ` = ${defaultValue}`;
};

export const displayValidate = (schema: any): string => {
  if (schema["x-tag-validate"]) {
    return schema["x-tag-validate"];
  }

  if (!hasValidate(schema)) {
    return "";
  }

  if (schema.pattern) {
    return `@r/${String(schema.pattern)}/`;
  }

  return `@${schema.exclusiveMinimum ? "(" : "["}${getMin(schema)},${getMax(
    schema
  )}${schema.exclusiveMaximum ? ")" : "]"}`;
};

const EnumLabel = ({
  title,
  children,
}: {
  title: string;
  children: string;
}) => (
  <Box sx={{ opacity: 0.6, display: "flex", lineHeight: 1.4, fontSize: 10 }}>
    <span>{title}</span>
    <Box
      component={"span"}
      sx={{ fontWeight: "normal", opacity: 0.8, marginLeft: "1em" }}
    >{`// ${children}`}</Box>
  </Box>
);

export const displayClassName = (schema: any): JSX.Element | null => {
  if (schema.enum) {
    return (
      <Box sx={{ display: "block" }}>
        {displayType(schema)}
        <Box
          sx={{
            fontSize: "0.8em",
            paddingLeft: "1em",
            paddingBottom: "0.6em",
          }}
        >
          {map(toEnumMap(schema), (label, key) => (
            <EnumLabel title={key} key={key}>
              {label}
            </EnumLabel>
          ))}
        </Box>
      </Box>
    );
  }

  const t = displayType(schema);

  if (!t) {
    return null;
  }

  return (
    <span>
      {t}
      <span>
        {displayValidate(schema)}
        {displayDefault(schema)}
      </span>
    </span>
  );
};

interface ISchemaProps {
  schema: any;
  name?: string;
  required?: boolean;
}

interface ISchemaRowProps extends ISchemaProps {
  nameRenderer?: (name: string, required: boolean, schema: any) => ReactNode;
  typeRenderer?: (type: string | JSX.Element | null, schema: any) => ReactNode;
}

const StyledSchemaName = ({
  deprecated,
  required,
  nullable,
  ...otherProps
}: {
  deprecated?: boolean;
  nullable?: boolean;
  required?: boolean;
} & React.HTMLAttributes<any>) => {
  const theme = useTheme();

  return (
    <Box
      {...otherProps}
      component={"span"}
      sx={[
        {
          opacity: 0.7,
        },
        deprecated ? { textDecoration: "line-through" } : {},
        nullable
          ? { "&:after": { content: `"??"`, color: theme.palette.error.main } }
          : {},
        !required
          ? { "&:after": { content: `"?"`, color: theme.palette.warning.main } }
          : {},
      ]}
    />
  );
};

const StyledSchemaType = (props: React.HTMLAttributes<any>) => (
  <Box
    {...props}
    component={"span"}
    sx={{
      display: "block",
      fontWeight: "bold",
      mb: 2,
      wordBreak: "keep-all",
    }}
  />
);

const defaultNameRenderer = (
  name: string,
  required: boolean,
  schema: any = {}
) =>
  name && (
    <StyledSchemaName
      required={required}
      deprecated={schema.deprecated}
      nullable={schema.nullable}
    >
      {name}
    </StyledSchemaName>
  );

const defaultTypeRenderer = (type: any) => (
  <StyledSchemaType>{type}</StyledSchemaType>
);

export const Description = ({
  desc,
  prefix,
}: {
  desc: string;
  prefix?: string;
}) => {
  const lines = (desc || "").split("\n");

  if (lines.length > 1) {
    const line = lines[0];

    lines.shift();

    return (
      <Tooltip
        sx={{ userSelect: "auto" }}
        title={
          <div style={{ maxWidth: "200px" }}>
            <Markdown>{lines.join("\n\n")}</Markdown>
          </div>
        }
      >
        <Box sx={{ position: "relative", fontFamily: "monospace" }}>
          <span>
            {prefix}
            {line}
          </span>
          &nbsp;...
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      component={"span"}
      sx={{ position: "relative", fontFamily: "monospace" }}
    >
      {prefix}
      {desc}
    </Box>
  );
};

const SchemaRow = ({
  schema,
  name,
  required,
  nameRenderer = defaultNameRenderer,
  typeRenderer = defaultTypeRenderer,
}: ISchemaRowProps) => {
  const theme = useTheme();

  const description = `${
    schema["x-param-in"]
      ? `@in ${schema["x-param-in"]}${
          schema["x-content-type"]
            ? ` Content-Type = ${schema["x-content-type"]}`
            : ""
        } `
      : ""
  }${schema.description || ""}`;

  return (
    <Stack component={"span"} direction={"row"} sx={{ position: "relative" }}>
      {name && (
        <Box component={"span"} sx={{ mr: 1 }}>
          {nameRenderer(name || "", !!required, schema)}
        </Box>
      )}
      {description && (
        <Box
          sx={{
            position: "absolute",
            color: theme.palette.primary.main,
            lineHeight: 1,
            fontSize: "10px",
            opacity: 0.7,
            top: "-1em",
            left: 0,
          }}
        >
          <Description desc={description} prefix={"// "} />
        </Box>
      )}
      <Box
        component={"span"}
        sx={{
          display: "block",
          fontFamily: "monospace",
        }}
      >
        {typeRenderer(displayClassName(schema), schema)}
      </Box>
    </Stack>
  );
};

const PropRow = ({ children }: { children: any }) => (
  <Box
    component={"span"}
    sx={{
      display: "block",
      position: "relative",
      px: 1,
    }}
  >
    {children}
  </Box>
);

const renderSchema = (
  schema: any,
  name?: string,
  required?: boolean
): JSX.Element => {
  if (isArraySchema(schema)) {
    return (
      <SchemaRow
        key={name}
        name={name}
        required={required}
        schema={schema}
        typeRenderer={(type) => {
          const shouldShowClassName =
            !!schema["x-id"] && !isObjectSchema(schema.items || {});

          return (
            <Stack spacing={1} direction="row" component={"span"}>
              <Box component={"span"} sx={{ display: "flex" }}>
                <StyledSchemaType>
                  [
                  {schema.maxItems && schema.maxItems === schema.minItems
                    ? schema.minItems
                    : ""}
                  ]
                </StyledSchemaType>
                {renderSchema(schema.items || {}, undefined, undefined)}
              </Box>
              {shouldShowClassName && (
                <Box
                  component={"span"}
                  sx={{
                    display: "block",
                    lineHeight: 1.4,
                    fontSize: 8,
                    opacity: 0.5,
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                >
                  {type}
                </Box>
              )}
            </Stack>
          );
        }}
      />
    );
  }

  if (isObjectSchema(schema)) {
    return (
      <SchemaRow
        key={name}
        name={name}
        required={required}
        schema={schema}
        typeRenderer={(type) => {
          const asMap = isObject(schema.additionalProperties);

          return (
            <Box sx={asMap ? { display: "flex", flexWrap: "nowrap" } : {}}>
              {asMap ? (
                <StyledSchemaType>
                  <Box component={"span"}>
                    <span>map[</span>
                    {displayClassName(
                      schema.propertyNames || { type: "string" }
                    )}
                    <span>]</span>
                  </Box>
                </StyledSchemaType>
              ) : (
                type && (
                  <StyledSchemaType>
                    {type}
                    <Box
                      component={"span"}
                      sx={{ opacity: 0.5, fontWeight: "normal" }}
                    >
                      {"{}"}
                    </Box>
                  </StyledSchemaType>
                )
              )}
              <div>
                {asMap ? (
                  <>{renderSchema(schema.additionalProperties)}</>
                ) : (
                  <>
                    {map(
                      get(schema, "x-id") === "RequestParameter"
                        ? keys(schema.properties || {})
                        : sortBy(keys(schema.properties || {})),
                      (propName: string) => {
                        const propSchema = (schema.properties || {})[propName];

                        return (
                          <PropRow key={propName}>
                            {renderSchema(
                              propSchema,
                              propName,
                              includes(schema.required || [], propName)
                            )}
                          </PropRow>
                        );
                      }
                    )}
                  </>
                )}
              </div>
            </Box>
          );
        }}
      />
    );
  }

  return (
    <SchemaRow key={name} name={name} required={required} schema={schema} />
  );
};

export const SchemaView = ({ schema, ...otherProps }: ISchemaProps) => {
  const openapi = useOpenAPI();

  if (isEmpty(schema)) {
    return <span />;
  }

  const patchedSchema = deRefs(schema, openapi.components.schemas);

  return (
    <Box
      {...otherProps}
      sx={{
        fontSize: "14px",
        mt: 2,
        wordBreak: "keep-all",
        whiteSpace: "nowrap",
      }}
    >
      {renderSchema(patchedSchema)}
    </Box>
  );
};

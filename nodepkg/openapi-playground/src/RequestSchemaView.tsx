import {
  forEach,
  get,
  has,
  last,
  includes,
  isObject,
  isUndefined,
  map,
  replace,
  some,
  isArray,
} from "@innoai-tech/lodash";
import { Box, useTheme, SxProps, Theme } from "@mui/material";
import { createContext, Fragment, ReactNode, useContext } from "react";
import { isArraySchema, isObjectSchema } from "./utils";
import { createProvider } from "@nodepkg/state";
import { Markdown } from "@nodepkg/markdown";
import type { StateSubject } from "@innoai-tech/reactutil";

export type Schema = {
  type?: string;
  [x: string]: any;
};

export const RequestSchemaProvider = createProvider(
  ({
    rootSchema,
    schemaBreadcrumbs$,
  }: {
    rootSchema: Schema;
    schemaBreadcrumbs$: StateSubject<Schema[]>;
  }) => {
    return {
      rootSchema,
      schemaBreadcrumbs$,
      resolveSchemaByRef: (ref: string): Schema => {
        return get(rootSchema, ref.slice(2).split("/"));
      },
    };
  }
);

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
      "enum",
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

const Token = ({
  sx,
  children,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) => (
  <Box
    sx={[
      ...(isArray(sx) ? sx : [sx]),
      {
        display: "inline-table",
        lineHeight: 1.1,
      },
    ]}
  >
    {children}
  </Box>
);

const Annotation = ({ name, value }: { name: string; value: any }) => {
  const theme = useTheme();

  if (value == "") {
    return null;
  }

  return (
    <Line>
      <Token
        sx={{
          opacity: 0.7,
          fontSize: "0.8em",
          wordBreak: "keep-all",
          whiteSpace: "nowrap",
        }}
      >
        <Token sx={{ color: theme.palette.info.main }}>{`@${name}(`}</Token>
        {`${value}`}
        <Token sx={{ color: theme.palette.info.main }}>{`)`}</Token>
      </Token>
    </Line>
  );
};

export const TypeLink = ({
  sx,
  onClick,
  children,
}: {
  sx?: SxProps<Theme>;
  onClick: () => void;
  children: ReactNode;
}) => {
  return (
    <Box
      component="a"
      href={"#"}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      sx={{
        ...sx,
        lineHeight: 1.1,
        display: "inline-block",
        textDecoration: "none",
        color: "inherit",
        fontWeight: "bold",
      }}
    >
      {children}
    </Box>
  );
};

const PropName = ({
  deprecated,
  required,
  nullable,
  children,
}: {
  deprecated?: boolean;
  nullable?: boolean;
  required?: boolean;
  children: ReactNode;
} & React.HTMLAttributes<any>) => {
  const theme = useTheme();

  return (
    <Token
      sx={[
        {
          color: theme.palette.primary.main,
        },
        deprecated ? { textDecoration: "line-through" } : {},
        nullable
          ? { "&:after": { content: `"??"`, color: theme.palette.error.main } }
          : {},
        !required
          ? { "&:after": { content: `"?"`, color: theme.palette.warning.main } }
          : {},
      ]}
    >
      {children}
    </Token>
  );
};

const IntentContext = createContext(0);

const Line = ({
  spacing = 0,
  children,
}: {
  spacing?: number;
  children?: ReactNode;
}) => {
  const i = useContext(IntentContext);

  return (
    <>
      <Box
        sx={{
          pl: i,
          my: spacing * 0.5,
          position: "relative",
          display: "block",
        }}
      >
        {children}
      </Box>
    </>
  );
};

export const Description = ({ schema }: { schema: any }) => {
  const theme = useTheme();

  const description = [
    schema["x-method"] ? `\`${schema["x-method"]} ${schema["x-path"]}\`` : "",
    schema["x-param-in"] ? `**@param_in** ${schema["x-param-in"]}` : "",
    schema["x-content-type"]
      ? `**@content_type** ${schema["x-content-type"]}`
      : "",
    schema["description"],
  ]
    .filter((v) => !!v)
    .join("\n\n");

  if (!description) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "relative",
        fontSize: "0.8em",
        "& p": {
          my: 0.2,
        },
        "& code": {
          wordBreak: "keep-all",
          whiteSpace: "nowrap",
        },
        color: theme.palette.text.secondary,
      }}
    >
      <Markdown>{description}</Markdown>
    </Box>
  );
};

const Indent = ({ children }: { children: ReactNode }) => {
  const i = useContext(IntentContext);

  return (
    <IntentContext.Provider value={i + 1}>{children}</IntentContext.Provider>
  );
};

export const isSimpleSchema = (schema: any = {}) => {
  return (
    schema["type"] === "string" ||
    schema["type"] === "boolean" ||
    schema["type"] === "integer" ||
    schema["type"] === "float"
  );
};

export const SchemaType = ({ schema }: { schema: Schema }): JSX.Element => {
  const schemaCtx = RequestSchemaProvider.use();

  if (schema["$ref"]) {
    const s = schemaCtx.resolveSchemaByRef(schema["$ref"]);

    if (isSimpleSchema(s)) {
      return <SchemaType schema={s} />;
    }

    return (
      <TypeLink
        onClick={() => {
          schemaCtx.schemaBreadcrumbs$.next((b) => [...b, s]);
        }}
      >
        {last(schema["$ref"].split("/"))}
      </TypeLink>
    );
  }

  if (schema["anyOf"]) {
    return (
      <>
        {map(schema["anyOf"], (s: any, i: number) => {
          return (
            <Fragment key={i}>
              {i > 0 && <Token>&nbsp;{"|"}&nbsp;</Token>}
              <SchemaType schema={s} />
            </Fragment>
          );
        })}
      </>
    );
  }

  if (isArraySchema(schema)) {
    return (
      <Token sx={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}>
        <Token>{"["}</Token>
        <Token>{"..."}</Token>
        <SchemaType schema={schema["items"]} />
        <Token>{"]"}</Token>
      </Token>
    );
  }

  if (isObjectSchema(schema)) {
    const asMap = isObject(schema["additionalProperties"]);

    if (asMap) {
      return (
        <>
          <Token>{"{"}</Token>
          <Indent>
            <Line>
              <Token sx={{ mr: 1 }}>{"[K:"}</Token>
              <SchemaType
                schema={schema["propertyNames"] || { type: "string" }}
              />
              <Token sx={{ mr: 1 }}>{"]:"}&nbsp;</Token>
              <SchemaType schema={schema["additionalProperties"]} />
            </Line>
          </Indent>
          <Token>{"}"}</Token>
        </>
      );
    }

    return (
      <>
        <Token>{"{"}</Token>
        <br />
        <Indent>
          <>
            {map(schema["properties"], (propSchema, propName) => {
              return (
                <Fragment key={propName}>
                  <Line spacing={2}>
                    <Description schema={propSchema} />
                    <Token sx={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}>
                      <PropName
                        required={includes(schema["required"] || [], propName)}
                        nullable={propSchema["nullable"]}
                        deprecated={propSchema["deprecated"]}
                      >
                        {propName}
                      </PropName>
                      <Token sx={{ mr: 1 }}>{":"}</Token>
                      <SchemaType schema={propSchema} />
                    </Token>
                  </Line>
                </Fragment>
              );
            })}
          </>
        </Indent>
        <Token>{"}"}</Token>
      </>
    );
  }

  const [type, format, defaultValue] = [
    schema["type"],
    schema["format"],
    schema["default"],
  ];

  return (
    <>
      <Token sx={{ fontWeight: "bold" }}>{type || "any"}</Token>
      <Indent>
        {format && <Annotation name={"format"} value={format} />}
        {!isUndefined(defaultValue) && (
          <Annotation name={"default"} value={defaultValue} />
        )}
        {!hasValidate(schema) && (
          <Annotation name={"validate"} value={displayValidate(schema)} />
        )}
        {schema["enum"] && (
          <>
            {map(schema["enum"], (value, i) => (
              <Annotation
                key={value}
                name={"enum"}
                value={`${value},${JSON.stringify(
                  get(schema, ["x-enum-labels", i], value)
                )}`}
              />
            ))}
          </>
        )}
      </Indent>
    </>
  );
};

export const RequestSchemaView = ({ schema }: { schema: any }) => {
  return (
    <Box
      sx={{
        fontSize: "13px",
        fontFamily: "monospace",
      }}
    >
      <Description schema={schema} />
      <SchemaType schema={schema} />
    </Box>
  );
};

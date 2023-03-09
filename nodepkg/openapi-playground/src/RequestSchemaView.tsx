import {
  forEach,
  get,
  has,
  includes,
  isUndefined,
  map,
  replace,
  some,
  isArray
} from "@innoai-tech/lodash";
import { Box, useTheme, SxProps, Theme } from "@mui/material";
import { createContext, Fragment, ReactNode, useContext } from "react";
import { createProvider } from "@nodepkg/runtime";
import { Markdown } from "@nodepkg/markdown";
import type { StateSubject } from "@innoai-tech/reactutil";
import {
  LSP,
  SchemaAnyType,
  SchemaArrayType,
  SchemaObjectType,
  SchemaRefType,
  SchemaStringType,
  SchemaType,
  SchemaTypeNode,
  SchemaUnionType
} from "@nodepkg/jsonschema";

export type Schema = {
  type?: string;
  [x: string]: any;
};

export const RequestSchemaProvider = createProvider(
  ({
     lsp,
     schemaBreadcrumbs$
   }: {
    lsp: LSP;
    schemaBreadcrumbs$: StateSubject<SchemaType[]>;
  }) => {
    return {
      lsp,
      schemaBreadcrumbs$
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
      "minProperties"
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

export const displayValidate = (schema: SchemaType): string => {
  if (schema.meta("x-tag-validate")) {
    return schema.meta("x-tag-validate");
  }

  if (!hasValidate(schema)) {
    return "";
  }

  if (schema.meta("pattern")) {
    return `@r/${String(schema.meta("pattern"))}/`;
  }

  return `@${schema.meta("exclusiveMinimum")} ? "(" : "["}${getMin(
    schema.schema
  )},${getMax(schema.schema)}${schema.meta("exclusiveMaximum") ? ")" : "]"}`;
};

const Token = ({
                 sx,
                 children
               }: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) => (
  <Box
    sx={[
      ...(isArray(sx) ? sx : [sx]),
      {
        display: "inline-table",
        lineHeight: 1.1
      }
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
          whiteSpace: "nowrap"
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
                           children
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
        fontWeight: "bold"
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
                    children
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
          color: theme.palette.primary.main
        },
        deprecated ? { textDecoration: "line-through" } : {},
        nullable
          ? { "&:after": { content: `"??"`, color: theme.palette.error.main } }
          : {},
        !required
          ? { "&:after": { content: `"?"`, color: theme.palette.warning.main } }
          : {}
      ]}
    >
      {children}
    </Token>
  );
};

const IntentContext = createContext(0);

const Line = ({
                spacing = 0,
                children
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
          display: "block"
        }}
      >
        {children}
      </Box>
    </>
  );
};

export const Description = ({ schema }: { schema: SchemaType }) => {
  const theme = useTheme();

  const description = [
    schema.meta("x-method")
      ? `\`${schema.meta("x-method")} ${schema.meta("x-path")}\``
      : "",
    schema.meta("x-param-in")
      ? `**@param_in** ${schema.meta("x-param-in")}`
      : "",
    schema.meta("x-content-type")
      ? `**@content_type** ${schema.meta("x-content-type")}`
      : "",
    schema.meta("description")
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
          my: 0.2
        },
        "& code": {
          wordBreak: "keep-all",
          whiteSpace: "nowrap"
        },
        color: theme.palette.text.secondary
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

export const SchemaTypeView = ({
                                 schema
                               }: {
  schema: SchemaType;
}): JSX.Element => {
  const schemaCtx = RequestSchemaProvider.use();

  if (schema instanceof SchemaTypeNode) {
    return <SchemaTypeView schema={schema.underlying} />;
  }

  if (schema instanceof SchemaRefType) {
    const s = schema.underlying;

    if (!(s instanceof SchemaObjectType || s instanceof SchemaUnionType)) {
      return <SchemaTypeView schema={s} />;
    }

    return (
      <TypeLink
        onClick={() => {
          schemaCtx.schemaBreadcrumbs$.next((b) => [...b, s]);
        }}
      >
        {schema.name}
      </TypeLink>
    );
  }

  if (schema instanceof SchemaUnionType) {
    return (
      <>
        {schema.oneOf.map((s, i) => {
          return (
            <Fragment key={i}>
              {i > 0 && <Token>&nbsp;{"|"}&nbsp;</Token>}
              <SchemaTypeView schema={s} />
            </Fragment>
          );
        })}
      </>
    );
  }

  if (schema instanceof SchemaArrayType) {
    return (
      <Token sx={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}>
        <Token>{"["}</Token>
        <Token>{"..."}</Token>
        <SchemaTypeView schema={schema.items ?? new SchemaAnyType({})} />
        <Token>{"]"}</Token>
      </Token>
    );
  }

  if (schema instanceof SchemaObjectType) {
    return (
      <>
        <Token>{"{"}</Token>
        <br />
        <Indent>
          <>
            {schema.propNames.map((propName) => {
              const propSchema = schema.prop(propName) ?? new SchemaAnyType({});

              return (
                <Fragment key={propName}>
                  <Line spacing={2}>
                    <Description schema={propSchema} />
                    <Token sx={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}>
                      <PropName
                        required={includes(schema.required, propName)}
                        nullable={propSchema.meta("nullable")}
                        deprecated={propSchema.meta("deprecated")}
                      >
                        {propName}
                      </PropName>
                      <Token sx={{ mr: 1 }}>{":"}</Token>
                      <SchemaTypeView schema={propSchema} />
                    </Token>
                  </Line>
                </Fragment>
              );
            })}
          </>
        </Indent>
        {schema.additionalProperties && (
          <>
            <Indent>
              <Line>
                <Token sx={{ mr: 1 }}>{"[K:"}</Token>
                <SchemaTypeView
                  schema={new SchemaStringType({ type: "string" })}
                />
                <Token sx={{ mr: 1 }}>{"]:"}&nbsp;</Token>
                <SchemaTypeView schema={schema.additionalProperties} />
              </Line>
            </Indent>
          </>
        )}
        <Token>{"}"}</Token>
      </>
    );
  }

  const [type, format, enumValues, defaultValue] = [
    schema.meta("type"),
    schema.meta("format"),
    schema.meta("enum"),
    schema.meta("default")
  ];

  if (enumValues && enumValues.length == 1) {
    return <Token>{JSON.stringify(enumValues[0])}</Token>;
  }

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
        {enumValues && (
          <>
            {map(enumValues, (value: any, i) => (
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

export const RequestSchemaView = ({ schema }: { schema?: SchemaType }) => {
  if (!schema) {
    return null;
  }

  return (
    <Box
      sx={{
        fontSize: "13px",
        fontFamily: "monospace"
      }}
    >
      <Description schema={schema} />
      <SchemaTypeView schema={schema} />
    </Box>
  );
};

import {
  forEach,
  get,
  has,
  includes,
  isUndefined,
  map,
  replace,
  some,
} from "@nodepkg/runtime/lodash";
import { Box, styled } from "@nodepkg/ui";
import {
  createProvider,
  component,
  t,
  type VNodeChild,
} from "@nodepkg/runtime";
import {
  LSP,
  SchemaAnyType,
  SchemaArrayType,
  SchemaObjectType,
  SchemaRefType,
  SchemaStringType,
  SchemaType,
  SchemaTypeNode,
  SchemaUnionType,
  SchemaIntersectionType,
} from "@nodepkg/jsonschema";
import { type ObservableRef } from "@nodepkg/runtime";
import { Markdown } from "@nodepkg/vuemarkdown";

export const RequestSchemaProvider = createProvider(
  {
    lsp: t.custom<LSP>(),
    schemaBreadcrumbs$: t.custom<ObservableRef<SchemaType[]>>(),
  },
  (props) => {
    return {
      lsp: props.lsp,
      schemaBreadcrumbs$: props.schemaBreadcrumbs$,
    };
  },
  {
    name: "RequestSchema",
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

const Token = styled("div")({
  display: "inline-table",
  textStyle: "sys.label-small",
  fontWeight: "bold",
  fontFamily: "inherit",
});

const Annotation = ({ name, value }: { name: string; value: any }) => {
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
        <Token sx={{ color: "sys.primary" }}>{`@${name}(`}</Token>
        {`${value}`}
        <Token sx={{ color: "sys.primary" }}>{`)`}</Token>
      </Token>
    </Line>
  );
};

export const TypeLink = styled(
  "a",
  {
    onClick: t.custom<() => void>(),
    $default: t.custom<VNodeChild>().optional(),
  },
  ({}, { slots, emit }) => {
    return (Root) => (
      <Root
        href={"#"}
        onClick={(e) => {
          e.preventDefault();
          emit("click");
        }}
      >
        {slots.default?.()}
      </Root>
    );
  }
)({
  display: "inline-block",
  textDecoration: "none",
  color: "inherit",
  fontWeight: "bold",
});

const PropName = styled(Token, {
  deprecated: t.boolean().optional(),
  optional: t.boolean().optional(),
  nullable: t.boolean().optional(),
})({
  color: "sys.primary",

  _deprecated: {
    textDecoration: "line-through",
  },
  _nullable: {
    "&:after": { content: `"??"`, color: "sys.error" },
  },
  _optional: {
    "&:after": { content: `"?"`, color: "sys.secondary" },
  },
});

const IntentContextProvider = createProvider(
  () => {
    return {
      indent: 0,
    };
  },
  {
    name: "IntentContext",
  }
);

const Line = styled(
  "div",
  {
    spacing: t.number().optional().default(0),
    $default: t.custom<VNodeChild>().optional(),
  },
  (props, { slots }) => {
    const i = IntentContextProvider.use();

    return (Root) => (
      <Root
        style={{
          paddingLeft: `${i.indent}em`,
          marginTop: props.spacing * 0.5,
        }}
      >
        {slots.default?.()}
      </Root>
    );
  }
)({
  position: "relative",
  display: "block",
});

export const Description = styled(
  "div",
  {
    schema: t.custom<SchemaType>(),
  },
  (props, {}) => {
    return (Root) => {
      const schema = props.schema;

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
        schema.meta("description"),
      ]
        .filter((v) => !!v)
        .join("\n\n");

      if (!description) {
        return null;
      }

      return (
        <Root>
          <Markdown text={description} />
        </Root>
      );
    };
  }
)({
  position: "relative",
  fontSize: "0.8em",
  "& p": {
    mt: 12,
    mb: 2,
  },
  "& code": {
    wordBreak: "keep-all",
    whiteSpace: "nowrap",
  },
  textStyle: "sys.body-small",
  color: "sys.tertiary",
});

const Indent = component(
  {
    $default: t.custom<VNodeChild>().optional(),
  },
  ({}, { slots }) => {
    const i = IntentContextProvider.use();

    return () => (
      <IntentContextProvider
        value={{
          indent: i.indent + 1,
        }}
      >
        {slots.default?.()}
      </IntentContextProvider>
    );
  }
);

export const SchemaTypeView = component(
  {
    schema: t.custom<SchemaType>(),
  },
  (props) => {
    return () => {
      const schema = props.schema;

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
              schemaCtx.schemaBreadcrumbs$.next([
                ...schemaCtx.schemaBreadcrumbs$.value,
                s,
              ]);
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
                <>
                  {i > 0 && <Token>&nbsp;{"|"}&nbsp;</Token>}
                  <SchemaTypeView schema={s} />
                </>
              );
            })}
          </>
        );
      }

      if (schema instanceof SchemaIntersectionType) {
        return (
          <>
            {schema.allOf
              .filter((s) => !(s instanceof SchemaAnyType))
              .map((s, i) => {
                return (
                  <>
                    {i > 0 && <Token>&nbsp;{"&"}&nbsp;</Token>}
                    <SchemaTypeView schema={s} />
                  </>
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
                  const propSchema =
                    schema.prop(propName) ?? new SchemaAnyType({});

                  return (
                    <>
                      <Line spacing={2}>
                        <Description schema={propSchema} />
                        <Token
                          sx={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}
                        >
                          <PropName
                            nullable={propSchema.meta("nullable")}
                            deprecated={propSchema.meta("deprecated")}
                            optional={!includes(schema.required, propName)}
                          >
                            {propName}
                          </PropName>
                          <Token sx={{ mr: "1em" }}>{":"}</Token>
                          <SchemaTypeView schema={propSchema} />
                        </Token>
                      </Line>
                    </>
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
        schema.meta("default"),
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
  }
);

export const RequestSchemaView = ({ schema }: { schema?: SchemaType }) => {
  if (!schema) {
    return null;
  }

  return (
    <Box
      sx={{
        fontFamily: "code",
        fontSize: 13,
      }}
    >
      <Description schema={schema} />
      <SchemaTypeView schema={schema} />
    </Box>
  );
};

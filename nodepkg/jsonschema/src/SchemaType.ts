import {
  get,
  has,
  includes,
  isArray,
  isNumber,
  isObject,
  isString,
  last,
  map,
  mapValues,
} from "@innoai-tech/lodash";
import type {
  JSONSchema,
  JSONSchemaArray,
  JSONSchemaBoolean,
  JSONSchemaExtendedObject,
  JSONSchemaNumber,
  JSONSchemaObject,
  JSONSchemaRef,
  JSONSchemaString,
  JSONSchemaUnion
} from "./JSONSchema";

export interface SchemaNodeContextOptions {
  resolve: (ref: string) => JSONSchema;
}

const propAndValues = (key: any) => {
  if (isArray(key)) {
    return key;
  }
  return [key, {}];
};

export class SchemaTypeContext {
  static create(options: SchemaNodeContextOptions): SchemaTypeContext {
    return new SchemaTypeContext(options);
  }

  constructor(public options: SchemaNodeContextOptions) {
  }

  private refs: Record<string, SchemaType> = {};

  resolve(ref: string): SchemaType {
    return (this.refs[ref] =
      this.refs[ref] ?? this.of(this.options.resolve(ref)));
  }

  of(schema: JSONSchema): SchemaType {
    if (has(schema, "$ref")) {
      return new SchemaRefType(this, schema as JSONSchemaRef);
    }

    if (has(schema, "oneOf")) {
      return new SchemaUnionType(this, schema as JSONSchemaUnion);
    }

    switch (get(schema, "type", "") as string) {
      case "boolean":
        return new SchemaBooleanType(schema as JSONSchemaBoolean);
      case "array":
        return new SchemaArrayType(schema as JSONSchemaArray, this);
      case "object":
        return new SchemaObjectType(schema as JSONSchemaObject, this);
      case "number":
      case "integer":
        return new SchemaNumberType(schema as JSONSchemaNumber);
      case "string":
        return new SchemaStringType(schema as JSONSchemaString);
      default:
        if (has(schema, "allOf")) {
          const maybeObjects = get(schema, "allOf", [])
            .map((s) => this.of(s))
            .map((s) => SchemaType.indirect(s))
            .filter((s) => s instanceof SchemaObjectType);

          if (maybeObjects.length > 1) {
            return new SchemaObjectType(schema as JSONSchemaObject, this);
          }
          return this.of(
            get(schema, "allOf", []).reduce((ret, v: any) => {
              return {
                ...ret,
                ...v
              };
            }, {})
          );
        }
        if (has(schema, "enum")) {
          if (isString(get(schema, ["enum", 0]))) {
            return new SchemaStringType(schema as JSONSchemaString);
          }
          if (isNumber(get(schema, ["enum", 0]))) {
            return new SchemaNumberType(schema as JSONSchemaNumber);
          }
        }
        return new SchemaAnyType({});
    }
  }
}

export class SchemaType<S extends JSONSchema = {}> {
  constructor(public schema: S) {
  }

  static indirect(schema: SchemaType): SchemaType {
    if (schema instanceof SchemaRefType) {
      return schema.underlying;
    }
    if (schema instanceof SchemaTypeNode) {
      return schema.underlying;
    }
    return schema;
  }

  static contains(schema: SchemaType, v: any): boolean {
    if (schema instanceof SchemaStringType) {
      return schema.enum?.includes(v) ?? false;
    }
    if (schema instanceof SchemaNumberType) {
      return schema.enum?.includes(v) ?? false;
    }
    if (schema instanceof SchemaBooleanType) {
      return schema.enum?.includes(v) ?? false;
    }
    return false;
  }

  resolve(
    instancePath: any[],
    parent: SchemaTypeNode | null
  ): SchemaTypeNode | null {
    if (instancePath.length == 0) {
      return SchemaTypeNode.of(this, parent);
    }
    return null;
  }

  get typedef(): string {
    return "unknown";
  }

  meta(key: string): any {
    return get(this.schema, key);
  }
}

export class SchemaTypeNode extends SchemaType {
  static of(
    node: SchemaType | null,
    parent: SchemaType | null
  ): SchemaTypeNode | null {
    if (!node) {
      return null;
    }
    if (parent) {
      if (parent instanceof SchemaTypeNode) {
        return new SchemaTypeNode(node, parent);
      }
      return new SchemaTypeNode(node, new SchemaTypeNode(parent));
    }
    return new SchemaTypeNode(node);
  }

  constructor(public underlying: SchemaType, public parent?: SchemaTypeNode) {
    super(underlying.schema);
  }

  override get typedef(): string {
    if (this.parent) {
      return `${this.parent.typedef}
  -> ${this.underlying.typedef}`;
    }
    return `${this.underlying.typedef}`;
  }

  get parents(): SchemaTypeNode[] {
    const parents: SchemaTypeNode[] = [];

    let node: SchemaTypeNode | undefined = this;

    while (node) {
      parents.push(node);
      node = node.parent;
    }

    return parents.reverse();
  }
}

export class SchemaAnyType extends SchemaType {
  override get typedef() {
    return "any";
  }
}

export class SchemaArrayType extends SchemaType {
  readonly items?: SchemaType;

  constructor(schema: JSONSchemaArray, private ctx: SchemaTypeContext) {
    super(schema);

    if (schema.items) {
      this.items = this.ctx.of(isObject(schema.items) ? schema.items : {});
    }
  }

  override resolve(
    keyPath: any[],
    parent: SchemaTypeNode | null
  ): SchemaTypeNode | null {
    if (keyPath.length == 0) {
      return SchemaTypeNode.of(this, parent);
    }

    const [_idx, ...others] = keyPath;

    if (_idx) {
      return (
        this.items?.resolve(others, SchemaTypeNode.of(this, parent)) ?? null
      );
    }
    return null;
  }

  override get typedef() {
    return `Array<${this.items?.typedef}>`;
  }
}

export class SchemaObjectType extends SchemaType {
  static isExtended(
    schema: JSONSchemaObject
  ): schema is JSONSchemaExtendedObject {
    return has(schema, "allOf");
  }

  readonly extends?: SchemaType[];
  readonly properties?: Record<string, SchemaType>;
  readonly required: string[] = [];
  readonly additionalProperties?: SchemaType;

  constructor(schema: JSONSchemaObject, private ctx: SchemaTypeContext) {
    super(schema);

    if (SchemaObjectType.isExtended(schema)) {
      this.extends = map(schema.allOf, (item) => this.ctx.of(item));
    } else {
      this.required = schema.required || [];
      this.properties = mapValues(schema.properties, (propSchema) =>
        this.ctx.of(propSchema)
      );
      if (schema.additionalProperties) {
        this.additionalProperties = this.ctx.of(
          isObject(schema.additionalProperties)
            ? schema.additionalProperties
            : {}
        );
      }
    }
  }

  get propNames(): string[] {
    if (this.extends) {
      let names: string[] = [];

      for (let s of this.extends) {
        if (s instanceof SchemaRefType) {
          s = s.underlying;
        }
        if (s instanceof SchemaObjectType) {
          names = [...names, ...s.propNames];
        }
      }
      return names;
    }
    return Object.keys(this.properties || {});
  }

  prop(propName: string): SchemaType | null {
    if (this.extends) {
      let final: SchemaType | null = null;

      for (let s of this.extends) {
        if (s instanceof SchemaRefType) {
          s = s.underlying;
        }
        if (s instanceof SchemaObjectType) {
          const p = s.prop(propName);
          if (p) {
            final = p;
          }
        }
      }
      return final;
    }

    let schema: SchemaType | null = null;
    if (this.properties) {
      schema = this.properties[propName] ?? null;
    }
    return schema ?? this.additionalProperties ?? null;
  }

  override resolve(
    keyPath: any[],
    parent: SchemaTypeNode | null
  ): SchemaTypeNode | null {
    if (keyPath.length == 0) {
      return SchemaTypeNode.of(this, parent);
    }

    const [key, ...others] = keyPath;
    const [propName] = propAndValues(key);

    const propSchema = this.prop(propName);
    if (propSchema) {
      return propSchema.resolve(others, SchemaTypeNode.of(this, parent));
    }

    return null;
  }

  override get typedef() {
    if (this.extends) {
      return this.extends.map((e) => e.typedef).join(" & ");
    }

    const props = map(
      this.properties,
      (p, name) =>
        `${name}${includes(this.required, name) ? "" : "?"}: ${p.typedef}`
    ).join(", ");

    const additional = this.additionalProperties
      ? `[k: string]: ${this.additionalProperties.typedef}`
      : "";

    const propDefs = `${[props, additional].filter((v) => !!v).join(", ")}`;

    return `{ ${propDefs} }`;
  }
}

export class SchemaNumberType extends SchemaType {
  readonly enum?: number[];
  readonly type: string;

  constructor(schema: JSONSchemaNumber) {
    super(schema);
    this.type = schema.type || "number";
    this.enum = schema.enum;
  }

  override get typedef() {
    if (this.enum) {
      return this.enum.join(" | ");
    }
    return this.type;
  }
}

export class SchemaStringType extends SchemaType {
  readonly enum?: string[];

  constructor(schema: JSONSchemaString) {
    super(schema);
    this.enum = schema.enum;
  }

  override get typedef() {
    if (this.enum) {
      return this.enum.map((v) => `"${v}"`).join(" | ");
    }
    return "string";
  }
}

export class SchemaBooleanType extends SchemaType {
  readonly enum?: boolean[];

  constructor(schema: JSONSchemaBoolean) {
    super(schema);
    this.enum = schema.enum;
  }

  override get typedef() {
    return "boolean";
  }
}

export class SchemaRefType extends SchemaType<JSONSchemaRef> {
  constructor(private ctx: SchemaTypeContext, schema: JSONSchemaRef) {
    super(schema);
  }

  override get typedef() {
    return this.name;
  }

  get name() {
    return last(this.schema.$ref.split("/")) || "undefined";
  }

  override resolve(
    keyPath: any[],
    parent: SchemaTypeNode | null
  ): SchemaTypeNode | null {
    return this.underlying.resolve(keyPath, parent);
  }

  get underlying() {
    return this.ctx.resolve(this.schema.$ref);
  }
}

export class SchemaUnionType extends SchemaType {
  public unions: SchemaType[];
  public discriminator?: string;

  constructor(ctx: SchemaTypeContext, schema: JSONSchemaUnion) {
    super(schema);

    this.discriminator = schema.discriminator?.propertyName;

    this.unions = schema.oneOf.map((sub) =>
      ctx.of({
        ...sub,
        type: get(sub, "type", get(schema, "type")),
        ...(get(schema, "required")
          ? {
            required: [
              ...get(schema, "required", []),
              ...get(sub, "required", [])
            ]
          }
          : {})
      })
    );
  }

  get discriminatorEnum(): string[] {
    if (!this.discriminator) {
      return [];
    }

    return (
      this.unions.filter(
        (e) => e instanceof SchemaObjectType
      ) as SchemaObjectType[]
    )
      .map((e) => get(e.prop(this.discriminator!), "enum", [] as string[]))
      .flat();
  }

  mapping(discriminatorValue: string): SchemaObjectType | null {
    if (this.discriminator) {
      for (const node of this.unions) {
        if (node instanceof SchemaObjectType) {
          const discriminatorSchema = node.prop(this.discriminator);
          if (discriminatorSchema) {
            if (SchemaType.contains(discriminatorSchema, discriminatorValue)) {
              return node;
            }
          }
        }
      }
    }
    return null;
  }

  override resolve(
    keyPath: any[],
    parent: SchemaTypeNode | null
  ): SchemaTypeNode | null {
    if (keyPath.length == 0) {
      return SchemaTypeNode.of(this, parent);
    }

    if (this.discriminator) {
      const [key] = keyPath;
      const [prop, ctx] = propAndValues(key);

      const v = get(ctx, this.discriminator, "");

      if (v) {
        const matched = this.mapping(v);
        if (matched) {
          const ret = matched.resolve(keyPath, parent);
          if (ret) {
            return ret;
          }
        }
      }

      if (prop == this.discriminator) {
        return SchemaTypeNode.of(
          new SchemaStringType({
            type: "string",
            enum: this.discriminatorEnum
          }),
          parent
        );
      }

      return null;
    }

    for (const node of this.unions) {
      const ret = node.resolve(keyPath, parent);
      if (ret) {
        return ret;
      }
    }
    return null;
  }

  override get typedef() {
    return this.unions.map((t) => t.typedef).join(" | ");
  }
}

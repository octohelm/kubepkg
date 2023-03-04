import {
  has,
  isObject,
  map,
  mapValues,
  omit,
} from "@innoai-tech/lodash";

export class SchemaVisitor {
  static isObject = (schema: any) => schema.type === "object" || has(schema, "properties");
  static isArray = (schema: any) => schema.type === "array" || has(schema, "items");

  static create(schema: any, resolve: (ref: string, visitor: SchemaVisitor) => any, ...transformers: Array<(schema: any) => any>) {
    return new SchemaVisitor(schema, resolve, transformers);
  }

  constructor(
    private rootSchema: any,
    private resolve: (ref: string, visitor: SchemaVisitor) => any,
    private transformers: Array<(schema: any) => any> = []
  ) {
  }

  process(schema: any): any {
    if (typeof schema === "undefined") {
      return {};
    }

    for (const transformer of this.transformers) {
      schema = transformer(schema);
    }

    schema.nullable = undefined

    if (has(schema, "oneOf")) {
      return {
        ...schema,
        oneOf: map(schema.oneOf, (s) => this.process(s))
      };
    }

    if (has(schema, "allOf")) {
      return {
        ...schema,
        allOf: map(schema.allOf, (s) => this.process(s))
      };
    }

    if (schema.$ref) {
      const ret = this.resolve(schema.$ref, this);
      if (ret?.$ref) {
        return ret;
      }
      return this.process(ret);
    }

    if (SchemaVisitor.isObject(schema)) {
      return {
        ...schema,
        properties: mapValues(schema.properties, (propSchema) => this.process(propSchema)),
        propertyNames: this.process(schema.propertyNames || { type: "string" }),
        additionalProperties: schema.additionalProperties ? this.process(isObject(schema.additionalProperties) ? schema.additionalProperties : {}) : false
      };
    }

    if (SchemaVisitor.isArray(schema)) {
      return {
        ...schema,
        items: this.process(schema.items)
      };
    }

    return schema;
  }

  simplify(): any {
    return omit(this.process(this.rootSchema), ["$ref"]);
  }
}

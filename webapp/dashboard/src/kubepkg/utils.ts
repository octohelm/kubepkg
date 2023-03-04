import {
  forEach,
  has,
  isObject,
  map,
  mapValues,
  omit,
  pickBy,
  reduce,
  startsWith,
  uniq
} from "@innoai-tech/lodash";


export class SchemaVisitor {
  static isObject = (schema: any) => schema.type === "object" || has(schema, "properties");
  static isArray = (schema: any) => schema.type === "array" || has(schema, "items");

  static create(schema: any, resolve: (ref: string) => any, ...transformers: Array<(schema: any) => any>) {
    return new SchemaVisitor(schema, resolve, transformers);
  }

  constructor(
    private rootSchema: any,
    private resolve: (ref: string) => any,
    private transformers: Array<(schema: any) => any> = []
  ) {
  }

  private _process(schema: any): any {
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
        oneOf: map(schema.oneOf, (s) => this._process(s))
      };
    }

    if (has(schema, "allOf")) {
      return this._process(reduce(
        [
          ...schema.allOf,
          pickBy(schema, (_, k) => startsWith(k, "x-") || k === "description")
        ],
        (final, s) => {
          const f: any = {
            ...final
          };

          const next = this._process(s);

          forEach(next, (v, k) => {
            switch (k) {
              case "properties":
                f[k] = {
                  ...f[k],
                  ...(v as any)
                };
                break;
              case "required":
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                f[k] = uniq((f[k] || []).concat(v));
                break;
              default: {
                f[k] = v;
              }
            }
          });
          return f;
        },
        {}
      ));
    }

    if (schema.$ref) {
      return this._process(this.resolve(schema.$ref));
    }

    if (SchemaVisitor.isObject(schema)) {
      return {
        ...schema,
        properties: mapValues(schema.properties, (propSchema) => this._process(propSchema)),
        propertyNames: this._process(schema.propertyNames || { type: "string" }),
        additionalProperties: schema.additionalProperties ? this._process(isObject(schema.additionalProperties) ? schema.additionalProperties : {}) : false
      };
    }

    if (SchemaVisitor.isArray(schema)) {
      return {
        ...schema,
        items: this._process(schema.items)
      };
    }

    return schema;
  }

  simplify(): any {
    return omit(this._process(this.rootSchema), ["$ref"]);
  }
}

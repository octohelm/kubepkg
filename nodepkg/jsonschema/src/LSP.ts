import { type AnyType, refName, JSONSchemaDecoder } from "@nodepkg/runtime";
import { isUndefined, isString, get } from "@nodepkg/runtime/lodash";
import type { SchemaType } from "./SchemaType";
import { SchemaTypeContext, SchemaTypeNode } from "./SchemaType";
import type { JSONSchema } from "./JSONSchema";

export class LSP {
  static indirect(type: AnyType | null): AnyType | null {
    return type;
  }

  static create(schema: JSONSchema, resolve?: (ref: string) => JSONSchema) {
    return new LSP(schema, resolve);
  }

  constructor(
    private schema: JSONSchema,
    private readonly resolve: (ref: string) => JSONSchema = (ref: string) =>
      get(schema, ref.slice(2).split("/"), {})
  ) {
  }

  _type?: AnyType;
  private get type(): AnyType {
    return (this._type ??= JSONSchemaDecoder.decode(this.schema, (ref) => {
      return [this.resolve(ref), refName(ref)];
    }));
  }

  validate(data: any) {
    const [err] = this.type.validate(data);

    const errMaps: { [k: string]: string } = {};

    if (err) {
      for (const f of err.failures()) {
        let loc = f.path;

        if (isUndefined(f.value)) {
          loc = f.path.slice(0, f.path.length - 1);
        }

        if (f.type == "never") {
          // FIXME
          continue;
        }

        errMaps[`/${loc.join("/")}`] = (() => {
          if (isUndefined(f.value)) {
            return `缺失必填字段 ${JSON.stringify(f.key)}`;
          }

          switch (f.type) {
            case "never":
              return `未声明字段不允许`;
            case "string":
              return `字符类型不匹配`;
            case "number":
              return `数字类型不匹配`;
            case "integer":
              return `整数类型不匹配`;
            case "bool":
              return `布尔类型不匹配`;
            case "enums": {
              const t = this.typeAt(f.path)!;
              return `值只能是: ${Object.values(t.schema)
                .map((v) => JSON.stringify(v))
                .join(", ")}`;
            }
          }

          return f.message;
        })();
      }
    }

    return errMaps;
  }

  typeAt(path: any[]) {
    return LSP.indirect(this.visit(this.type, path));
  }

  _schemaType?: SchemaType;
  private get schemaType() {
    return (this._schemaType ??= SchemaTypeContext.create({
      resolve: this.resolve
    }).of(this.schema));
  }

  schemaAt(keyPath: any[]): SchemaTypeNode | null {
    return this.schemaType.resolve(keyPath, null);
  }

  private visit(type: AnyType, path: any[]): AnyType | null {
    const [first, ...others] = path;

    if (!isUndefined(first)) {
      for (const [f, _, t] of type.entries(isString(first) ? {} : [], {
        path: [],
        branch: []
      })) {
        if (f == first) {
          if (t.type == "never") {
            return t as AnyType;
          }

          if (others.length) {
            return this.visit(t as AnyType, others);
          }

          return t as AnyType;
        }
      }
    }

    return null;
  }
}

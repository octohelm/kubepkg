import type { JSONSchema } from "./JSONSchema";
import Ajv, { type ErrorObject } from "ajv/dist/ajv";
import { SchemaType, SchemaTypeContext, SchemaTypeNode } from "./SchemaType";
import { get } from "@innoai-tech/lodash";

export interface Localize {
  (errors?: null | ErrorObject[]): void;
}

export class LSP {
  static create(schema: JSONSchema, resolve?: (ref: string) => JSONSchema) {
    return new LSP(schema, resolve);
  }

  constructor(
    private schema: JSONSchema,
    private readonly resolve: (ref: string) => JSONSchema = (ref: string) =>
      get(schema, ref.slice(2).split("/"), {})
  ) {
  }

  _ajv: any;
  private get ajv() {
    return (this._ajv =
      this._ajv ??
      new Ajv({
        strictSchema: false,
        validateFormats: false,
        allErrors: false,
        allowMatchingProperties: true
      }));
  }

  validate(data: any, localize?: Localize) {
    if (this.ajv.validate(this.schema, data)) {
      return {};
    }

    const errors = this.ajv.errors;

    const parentInstancePath = (instancePath: string) => {
      const parts = instancePath.split("/");
      if (parts.length == 1) {
        return "";
      }
      return parts.slice(0, parts.length - 1).join("/");
    };

    const errMaps: { [k: string]: string } = {};

    for (const err of errors) {
      if (err.keyword === "additionalProperties") {
        if (err.params.additionalProperty) {
          err.instancePath += `/${err.params.additionalProperty}`;
        }
      }

      if (err.keyword === "discriminator") {
        err.instancePath += `/${err.params.tag}`;
      }

      if (localize) {
        localize([err]);
      }

      switch (err.keyword) {
        case "enum":
          errMaps[err.instancePath] = `${
            err.message
          }: ${err.params.allowedValues.join(", ")}`;
          break;
        default:
          errMaps[err.instancePath] = err.message;
      }
    }

    for (const instancePath in errMaps) {
      const pInstancePath = parentInstancePath(instancePath);
      if (pInstancePath != instancePath && errMaps[pInstancePath]) {
        delete errMaps[pInstancePath];
      }
    }

    return errMaps;
  }

  _type?: SchemaType;
  private get type() {
    return (this._type =
      this._type ??
      SchemaTypeContext.create({ resolve: this.resolve }).of(this.schema));
  }

  schemaAt(keyPath: any[]): SchemaTypeNode | null {
    return this.type.resolve(keyPath, null);
  }
}

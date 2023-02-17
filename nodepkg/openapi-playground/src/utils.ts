import {
  forEach,
  has,
  isObject,
  mapValues,
  pickBy,
  reduce,
  replace,
  startsWith,
  uniq,
} from "@innoai-tech/lodash";

export const isObjectSchema = (schema: any) =>
  schema.type === "object" || has(schema, "properties");

export const isArraySchema = (schema: any) =>
  schema.type === "array" || has(schema, "items");

export const cleanupSchema = <T extends {}>(schema: any): T => {
  if (typeof schema === "undefined") {
    return {} as T;
  }

  if (has(schema, "definitions")) {
    schema["definitions"] = mapValues(schema["definitions"], (s, name) => ({
      ...cleanupSchema<any>(s),
      "x-id": name,
    }));
  }

  if (has(schema, "allOf")) {
    return reduce(
      [
        ...schema.allOf,
        pickBy(schema, (_, k) => startsWith(k, "x-") || k === "description"),
      ],
      (final, s) => {
        const f: any = {
          ...final,
        };
        const next = cleanupSchema(s);

        forEach(next, (v, k) => {
          switch (k) {
            case "properties":
              f[k] = {
                ...f[k],
                ...(v as any),
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
    ) as T;
  }

  if (startsWith(schema.$ref, "#/components/schemas/")) {
    schema.$ref = replace(
      schema.$ref,
      "#/components/schemas/",
      "#/definitions/"
    );
    return schema;
  }

  if (isObjectSchema(schema)) {
    if (isObject(schema.additionalProperties)) {
      const additionalProperties: any = cleanupSchema<any>(
        schema.additionalProperties
      );

      if (isObject(schema.propertyNames)) {
        const propertyNames: any = cleanupSchema<any>(schema.propertyNames);

        return {
          ...schema,
          additionalProperties,
          propertyNames: propertyNames,
        };
      }

      return {
        ...schema,
        additionalProperties,
      };
    }

    return {
      ...schema,
      properties: mapValues(schema.properties, (propSchema) =>
        cleanupSchema<any>(propSchema)
      ),
    };
  }

  if (isArraySchema(schema)) {
    return {
      ...schema,
      items: cleanupSchema<any>(schema.items),
    };
  }

  return schema;
};

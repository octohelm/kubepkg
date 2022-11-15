import {
  Dictionary,
  forEach,
  has,
  isObject,
  mapValues,
  pickBy,
  reduce,
  replace,
  startsWith,
  uniq
} from "@innoai-tech/lodash";

export const isObjectSchema = (schema: any) => schema.type === "object" || has(schema, "properties");
export const isArraySchema = (schema: any) => schema.type === "array" || has(schema, "items");

export const deRefs = <T extends {}>(
  schema: any,
  definitions: Dictionary<any> = {},
  processed: { [k: string]: boolean } = {}
): T => {
  if (typeof schema === "undefined") {
    return {} as T;
  }

  if (has(schema, "allOf")) {
    return reduce(
      [...schema.allOf, pickBy(schema, (_, k) => startsWith(k, "x-"))],
      (final, s) => {
        const f: any = {
          ...final
        };
        const next = deRefs(s, definitions, processed);

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
    ) as T;
  }

  if (startsWith(schema.$ref, "#/components/schemas/")) {
    const refId = replace(schema.$ref, "#/components/schemas/", "") || schema["x-id"];

    if (definitions[refId]) {
      if (!processed[refId]) {
        processed[refId] = true;

        return {
          ...schema,
          ...deRefs<any>(definitions[refId], definitions, processed),
          $ref: undefined,
          "x-id": refId
        };
      }

      return {
        ...schema,
        $ref: undefined,
        type: "circular",
        "x-id": refId
      };
    }
  }

  if (isObjectSchema(schema)) {
    const patchedProperties = mapValues(schema.properties, (propSchema) =>
      deRefs<any>(propSchema, definitions, processed)
    );

    if (isObject(schema.additionalProperties)) {
      const additionalProperties: any = deRefs<any>(schema.additionalProperties, definitions, processed);

      if (isObject(schema.propertyNames)) {
        const propertyNames: any = deRefs<any>(schema.propertyNames, definitions, processed);

        return {
          ...schema,
          additionalProperties,
          propertyNames: propertyNames
        };
      }

      return {
        ...schema,
        additionalProperties
      };
    }

    return {
      ...schema,
      properties: patchedProperties
    };
  }

  if (isArraySchema(schema)) {
    return {
      ...schema,
      items: deRefs<any>(schema.items, definitions, processed)
    };
  }

  return schema;
};

export type JSONSchemaMetadata = {
  description?: string;
  nullable?: boolean;
  default?: any;
  definitions?: Record<string, JSONSchema>;
  [x: string]: any;
};

export type JSONSchemaString = {
  type?: "string";
  enum?: string[];

  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
} & JSONSchemaMetadata;

export type JSONSchemaNumber = {
  type?: "number" | "integer";
  enum?: number[];
  format?: string;

  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
} & JSONSchemaMetadata;

export type JSONSchemaBoolean = {
  type: "boolean";
  enum?: boolean[];
} & JSONSchemaMetadata;

export type JSONSchemaArray = {
  type: "array";
  items?: JSONSchema | boolean;
  prefixItems?: JSONSchema[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: true;
} & JSONSchemaMetadata;

export type JSONSchemaObjectBasic = {
  type: "object";
  required?: string[];
  properties?: Record<string, JSONSchema>;

  propertyNames?: JSONSchemaString;
  additionalProperties?: JSONSchema | boolean;
  minProperties?: number;
  maxProperties?: number;
} & JSONSchemaMetadata;

export type JSONSchemaUnion = {
  oneOf: Array<JSONSchema>;
  type?: "object";
  discriminator?: {
    propertyName: string;
  };
};

export type JSONSchemaExtendedObject = {
  allOf: Array<JSONSchemaObject | JSONSchemaRef>;
};

export type JSONSchemaObject = JSONSchemaObjectBasic | JSONSchemaExtendedObject;

export type JSONSchemaAny = {} & JSONSchemaMetadata;

export type JSONSchemaRef = {
  $ref: string;
};

export type JSONSchemaIntersection = {
  allOf: Array<JSONSchema>;
};

export type JSONSchema =
  | JSONSchemaString
  | JSONSchemaNumber
  | JSONSchemaBoolean
  | JSONSchemaArray
  | JSONSchemaObject
  | JSONSchemaAny
  | JSONSchemaRef
  | JSONSchemaIntersection
  | JSONSchemaUnion

import Ajv from "ajv";

const fixInstancePath = (...paths: any[]) => {
  if (paths.length === 0) {
    return "/";
  }
  if (paths.length === 1) {
    return paths[0] ? paths[0] : "/";
  }
  return paths.join("/");
};

const normalizeErrors = (_: Ajv, errors?: any[]) => {
  if (!errors) {
    return {};
  }

  const errorSet: { [JSONPointer: string]: string } = {};
  const processed: { [K: string]: boolean } = {};

  const setError = (msg: string, instancePath: string, ...paths: string[]) => {
    if (!processed[instancePath]) {
      processed[instancePath] = true;

      if (instancePath === "" && Object.keys(errorSet).length !== 0) {
        return;
      }
      errorSet[fixInstancePath(instancePath, ...paths)] = msg;
    }
  };

  // child error first
  errors.sort((a, b) => b.instancePath.length - a.instancePath.length);

  for (const err of errors) {
    switch (err.keyword) {
      case "enum":
        setError(
          `${err.message}: ${err.params.allowedValues.join(", ")}`,
          err.instancePath
        );
        break;
      case "additionalProperties":
        setError(err.message, err.instancePath, err.params.additionalProperty);
        break;
      case "required":
      case "maxItems":
      case "minItems":
        setError(err.message, err.instancePath, "");
        break;
      default:
        setError(err.message, err.instancePath);
    }
  }

  return errorSet;
};

export const createValidator = (schema: any) => {
  const ajv = new Ajv({
    strictSchema: false,
    validateFormats: false,
    allowUnionTypes: true,
    allowMatchingProperties: true,
    allErrors: true,
  });

  if (schema) {
    let validate = ajv.compile(schema);
    return (inputs: any) => {
      validate(inputs);
      return normalizeErrors(ajv, validate.errors as any[]);
    };
  }
  return;
};

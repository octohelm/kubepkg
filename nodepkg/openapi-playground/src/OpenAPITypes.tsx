export interface OpenAPI {
  openapi: "3.1.0";
  operations: Record<string, any>;
}

export type Schema = {
  type?: string;
  [x: string]: any;
};

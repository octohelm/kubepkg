import * as ex from "./ex";

import { ExpressionFactory } from "./Expression";

export * from "./Expression";

export { ex };

export const defaultExpressionFactory = ExpressionFactory.create({
  allOf: ex.allOf,
  anyOf: ex.anyOf,
  charCount: ex.charCount,
  eq: ex.eq,
  get: ex.get,
  gt: ex.gt,
  gte: ex.gte,
  lt: ex.lt,
  lte: ex.lte,
  match: ex.match,
  oneOf: ex.oneOf,
  pipe: ex.pipe,
  required: ex.required,
  select: ex.select,
  when: ex.when,
});

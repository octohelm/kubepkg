import { defineExpression } from "../Expression";

export const gte = defineExpression("gte", (min: number) => () => {
  const fn = (v: any) => v >= min;
  fn.errMsg = `不得小于 ${min}`;
  return fn;
});

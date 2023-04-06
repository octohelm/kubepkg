import { defineExpression } from "../Expression";

export const lte = defineExpression("max", (max: number) => () => {
  const fn = (v: any) => v <= max;
  fn.errMsg = `不得大于 ${max}`;
  return fn;
});

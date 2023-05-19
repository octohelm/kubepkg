import { defineExpression } from "../Expression";

export const lt = defineExpression("lt", (max: number) => () => {
  const fn = (v: any) => v < max;
  fn.errMsg = `需要小于 ${max}`;
  return fn;
});

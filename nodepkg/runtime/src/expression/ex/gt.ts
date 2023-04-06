import { defineExpression } from "../Expression";

export const gt = defineExpression("gt", (min: number) => () => {
  const fn = (v: any) => v > min;
  fn.errMsg = `需要大于 ${min}`;
  return fn;
});

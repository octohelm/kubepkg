import {
  type ExpressionBuildFunc,
  isValidBuildExprFn,
  defineExpression,
} from "../Expression";

export const select = defineExpression(
  "select",
  <TTarget extends any>(
      ...buildExprFns: ExpressionBuildFunc<TTarget, boolean>[]
    ) =>
    (ctx) => {
      for (const buildExprFn of buildExprFns) {
        const fn = buildExprFn(ctx);

        if (!isValidBuildExprFn(fn)) {
          continue;
        }

        if (fn) {
          return fn;
        }
      }

      return null;
    }
);

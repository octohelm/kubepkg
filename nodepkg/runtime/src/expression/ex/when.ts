import { get } from "@innoai-tech/lodash";
import { type ExpressionBuildFunc, defineExpression } from "../Expression";

export const when = defineExpression(
  "when",
  (
    condition: ExpressionBuildFunc<any, boolean>,
    then: ExpressionBuildFunc<any, any>
  ) => {
    return (ctx) => {
      if (condition(ctx)(get(ctx, "root"))) {
        return then(ctx);
      }
      return null;
    };
  }
);

import { isString, isArray } from "@innoai-tech/lodash";

export const isExpression = (args: any[]): boolean => {
  if (isArray(args) && args.length > 0) {
    return isString(args[0]);
  }
  return false;
};

export type Expression<TArgs extends any[] = any[]> = readonly [
  string,
  ...TArgs
];

export interface ExpressionFunc<TInput, TOutput, TContext extends object = {}> {
  (v: TInput, ctx?: TContext): TOutput;

  type: string;
  args: any[];
}

export interface ExpressionBuildFunc<
  TInput,
  TOutput,
  TContext extends object = {}
> {
  (ctx: TContext): ExpressionFunc<TInput, TOutput, TContext>;
}

export const isValidBuildExprFn = (fn: any) =>
  !!fn && fn.type && fn.type !== "noop";

export const walkExpression = (
  expr: any,
  cb: (name: string, args: any[]) => void
) => {
  if (isExpression(expr as any)) {
    const [name, ...args] = expr;
    cb(name, args);

    for (const arg of args) {
      walkExpression(arg, cb);
    }
  }
};

export type InferArgs<TArgs extends [...any[]]> = {
  [I in keyof TArgs]: TArgs[I] extends ExpressionBuildFunc<any, any>
    ? Expression<any>
    : TArgs[I];
};

export const keyPathToSchemaKeyPath = (ref: string) => {
  return `rootSchema${ref[0] === "[" ? ref : `.${ref}`}`
    .replace(/[.]/g, ".properties.")
    .replace(/\[[0-9]+]/g, ".items");
};

const noop = Object.assign((_: void) => null, {
  type: "noop",
});

interface BuilderRegister {
  registerToExpressionFactory(f: ExpressionFactory): void;
}

export class ExpressionFactory {
  static create(builders: Record<string, BuilderRegister>) {
    return new ExpressionFactory(builders);
  }

  private builders: Record<
    string,
    (...args: any[]) => ExpressionBuildFunc<any, any>
  > = {};

  constructor(builderRegisters: Record<string, BuilderRegister>) {
    Object.keys(builderRegisters).forEach((k) => {
      builderRegisters[k]!.registerToExpressionFactory(this);
    });
  }

  register(
    name: string,
    builder: (...args: any[]) => ExpressionBuildFunc<any, any>
  ) {
    this.builders[name] = builder;
  }

  create = <TInput, TOutput, TContext extends object = {}>(
    expr: Expression
  ): ExpressionBuildFunc<TInput, TOutput, TContext> => {
    const [name, ...args] = expr;
    if (!isString(name)) {
      throw new Error(`invalid '${expr}'`);
    }

    const b = this.builders[name];
    if (!b) {
      throw new Error(`unknown expression ${name}(${args})`);
    }

    // convert expr to expr build fns
    const argsOrBuildExprFns = args.map((e) => {
      if (isExpression(e)) {
        return this.create(e);
      }
      return e;
    });

    return (ctx: TContext): ExpressionFunc<TInput, TOutput> => {
      const exprFn = b(...argsOrBuildExprFns);

      let fn = exprFn(ctx);

      if (fn) {
        return new Proxy(fn, {
          get(target, prop: string | symbol): any {
            const type = target.type || name;
            const args = target.args || argsOrBuildExprFns;

            if (prop === "toString") {
              return () =>
                `${type}(${args.map((arg) =>
                  isString(arg) ? `"${arg}"` : arg
                )})`;
            }

            if (prop === "type") {
              return type;
            }

            if (prop === "args") {
              return args;
            }

            return (target as any)[prop];
          },
        });
      }

      return noop as any;
    };
  };
}

export const defineExpression = <
  TInput,
  TOutput,
  TContext extends object = {},
  TArgs extends any[] = any
>(
  name: string,
  buildExprFn: (
    ...args: TArgs
  ) => (ctx: TContext) => null | ((v: TInput) => TOutput)
) => {
  return Object.assign(
    (...args: InferArgs<TArgs>) => [name, ...args] as const,
    {
      registerToExpressionFactory: (factory: ExpressionFactory) => {
        factory.register(name, buildExprFn as any);
      },
    }
  );
};

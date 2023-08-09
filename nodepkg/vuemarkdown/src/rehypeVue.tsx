import { type Component } from "@nodepkg/runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "@innoai-tech/vuekit/jsx-runtime";

export function rehypeVue({
                            components
                          }: {
  components: Record<string, Component<any>>;
}) {
  // @ts-ignore
  Object.assign(this, { Compiler: compiler });

  function compiler(node: any) {
    return toJsxRuntime(node, {
      Fragment,
      jsx,
      jsxs,
      components
    });
  }
}

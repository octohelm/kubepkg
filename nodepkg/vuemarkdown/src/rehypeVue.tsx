import { type Component } from "@nodepkg/runtime";
import { whitespace } from "hast-util-whitespace";
// @ts-ignore
import tableCellStyle from "@mapbox/hast-util-table-cell-style";
import { toH } from "hast-to-hyperscript";
import { h } from "@nodepkg/runtime/vue";

const tableElements = new Set(["table", "thead", "tbody", "tfoot", "tr"]);

export function rehypeVue({
                            components
                          }: {
  components: Record<string, Component<any>>;
}) {
  // @ts-ignore
  Object.assign(this, { Compiler: compiler });

  function compiler(node: any) {
    return toH(createElement, tableCellStyle(node));
  }

  function createElement(
    name: string,
    props: any,
    children?: any[] | undefined
  ) {
    if (children && tableElements.has(name)) {
      children = children.filter((child) => !whitespace(child));
    }

    if (components[name]) {
      if (children) {
        return h(components[name] as any, props, () => children);
      }
      return h(components[name] as any, props);
    }

    if (children) {
      return h(name, props, children);
    }

    return h(name, props);
  }
}

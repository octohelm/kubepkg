import {
  SchemaType,
  SchemaObjectType,
  LSP,
  SchemaArrayType,
  SchemaStringType,
  SchemaUnionType
} from "@nodepkg/jsonschema";
import { get, has, last, map } from "@innoai-tech/lodash";
import type { EditorState } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";
import { syntaxTree } from "@codemirror/language";
import { Completion, snippetCompletion } from "@codemirror/autocomplete";

const unquote = (s: string) => {
  try {
    return JSON.parse(s);
  } catch (_) {
    return s;
  }
};

export const astNodeToValue = (state: EditorState, node: SyntaxNode | null) => {
  if (node) {
    switch (node.name) {
      case "Object":
        const obj: { [k: string]: any } = {};

        for (let p: SyntaxNode | null = node.firstChild; p != null; p = p.nextSibling) {
          if (p.name === "Property") {
            const propName = p.getChild("PropertyName")!;
            if (propName && p.lastChild) {
              obj[unquote(state.sliceDoc(propName.from, propName.to))] = astNodeToValue(state, p.lastChild);
            }
          }
        }
        return obj;
      case "Array":
        const arr: any[] = [];
        for (let p: SyntaxNode | null = node.firstChild; p != null; p = p.nextSibling) {
          if (!(p.name == "[" || p.name == "]")) {
            arr.push(astNodeToValue(state, p));
          }
        }
        return arr;
      case "String":
        return unquote(state.sliceDoc(node.from, node.to));
      case "Number":
        return parseFloat(state.sliceDoc(node.from, node.to));
      case "True":
        return true;
      case "False":
        return false;
      default:
        console.log(node.name);
    }
  }

  return null;
};

export const selectionAt = (state: EditorState, pos: number) => {
  // -1 to handle the array value
  let node = syntaxTree(state).resolve(pos, -1);

  // when -1
  // will got the error node
  if (node.type.isError) {
    node = node.parent!;
  }

  const selectionSet = {
    node: node,
    instancePath: [] as any[]
  };

  const resolveInstancePath = (node: SyntaxNode) => {
    if (node.parent) {
      const parent = node.parent;

      resolveInstancePath(parent);

      switch (parent.name) {
        case "Property":
          if (selectionSet.node.name !== "PropertyName") {
            const propName = parent.getChild("PropertyName")!;
            const prop = unquote(state.sliceDoc(propName.from, propName.to)).trim();

            if (prop) {
              selectionSet.instancePath.push([
                prop, astNodeToValue(state, parent.parent)
              ]);
            }
          }
          return;
        case "Array":
          let idx = 0;
          for (let item: SyntaxNode | null = parent.firstChild; item != null; item = item.nextSibling) {
            if (!(item.name == "[" || item.name == "]")) {
              if (item.from <= node.from && node.to <= item.to) {
                selectionSet.instancePath.push(idx);
                break;
              }
              idx++;
            }
          }
          return;
      }
    }
  };

  resolveInstancePath(node);

  return selectionSet;
};

export class JSONCompletion {
  constructor(private lsp: LSP) {
  }

  completionsAt(state: EditorState, pos: number): Completion[] {
    const selectionSet = selectionAt(state, pos);
    const schema = this.lsp.schemaAt(selectionSet.instancePath);
    if (!schema) {
      return [];
    }
    return this._resolveCompletions(schema, selectionSet);
  }

  private _resolveCompletions(
    schema: SchemaType,
    selection: ReturnType<typeof selectionAt>
  ): Completion[] {
    schema = SchemaType.indirect(schema);

    if (selection.node.name === "Object" || selection.node.name === "PropertyName") {
      let list: SchemaObjectType[] = [];

      if (schema instanceof SchemaUnionType) {
        if (schema.discriminator) {
          const [prop, obj] = last(selection.instancePath);
          const discriminatorValue = get(obj || {}, [prop, schema.discriminator]);

          if (!discriminatorValue) {
            return [
              snippetCompletion(`"${schema.discriminator}": "\${}"`, { label: schema.discriminator })
            ];
          }

          const matched = schema.mapping(discriminatorValue);

          if (matched) {
            list = [
              ...list,
              matched
            ];
          }
        } else {
          list = [
            ...list,
            ...schema.oneOf
              .map(SchemaType.indirect)
              .filter((s) => s instanceof SchemaObjectType) as SchemaObjectType[]
          ];
        }

      } else if (schema instanceof SchemaObjectType) {
        list = [
          ...list,
          schema
        ];
      }

      const completions: Completion[] = [];

      const [prop, obj] = last(selection.instancePath) ?? [];

      for (const schema of list) {
        for (const propName of schema.propNames) {
          if (has(obj || {}, [prop, propName])) {
            continue;
          }

          let subSchema = schema.prop(propName)!;

          subSchema = SchemaType.indirect(subSchema);

          const base = {
            label: propName,
            info: subSchema.meta("description")
          };

          if (selection.node.name == "Object") {
            let snippetHolder = "${}";

            if (subSchema instanceof SchemaUnionType && subSchema.discriminator) {
              snippetHolder = "{${}}";
            } else if (subSchema instanceof SchemaObjectType) {
              snippetHolder = "{${}}";
            } else if (subSchema instanceof SchemaArrayType) {
              snippetHolder = "[${}]";
            } else if (subSchema instanceof SchemaStringType) {
              snippetHolder = "\"${}\"";
            }

            completions.push(
              snippetCompletion(`"${propName}": ${snippetHolder}`, base)
            );
          } else {
            completions.push(base);
          }
        }
      }

      return completions;
    }

    if (get(schema, "enum")) {
      return map(get(schema, "enum", []), (v) => ({
        label: `${v}`,
        apply: selection.node.name === "String" ? `${v}` : JSON.stringify(v)
      }));
    }

    return [];
  }
}

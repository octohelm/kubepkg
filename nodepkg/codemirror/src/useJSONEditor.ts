import {
  autocompletion,
  Completion,
  CompletionResult,
  snippetCompletion,
  startCompletion
} from "@codemirror/autocomplete";
import { json } from "@codemirror/lang-json";
import { Diagnostic, linter } from "@codemirror/lint";
import { get, has, isObject, last, map } from "@innoai-tech/lodash";
import {
  CompletionContext,
  EditorState,
  EditorView,
  indentWithTab,
  keymap,
  SyntaxNode,
  syntaxTree
} from "./codemirror";
import { useExtension } from "./EditorContextProvider";
import { createValidator } from "./validator";

const unquote = (s: string) => {
  try {
    return JSON.parse(s);
  } catch (_) {
    return s;
  }
};

export const selectionSetAt = (state: EditorState, pos: number) => {
  const node = syntaxTree(state).resolve(pos);

  const selectionSet = {
    node: node,
    closestObject: null as SyntaxNode | null,
    selection: [] as string[],
    properties: [] as string[]
  };

  for (let p: SyntaxNode | null = node; p != null; p = p.parent) {
    switch (p.name) {
      case "Property":
        if (selectionSet.node.name !== "PropertyName") {
          const propName = p.getChild("PropertyName")!;
          const prop = unquote(
            state.sliceDoc(propName.from, propName.to)
          ).trim();
          if (prop) {
            selectionSet.selection.unshift(prop);
          }
        }
        break;
      case "Object":
        if (!selectionSet.closestObject) {
          selectionSet.closestObject = p;
        }
        break;
    }
  }

  if (selectionSet.closestObject) {
    for (
      let p = selectionSet.closestObject.firstChild;
      p != null;
      p = p.nextSibling
    ) {
      if (p.name == "Property") {
        const propName = p.getChild("PropertyName")!;
        selectionSet.properties.unshift(
          unquote(state.sliceDoc(propName.from, propName.to))
        );
      }
    }
  }

  return selectionSet;
};

export const isSimpleSchema = (schema: any) => {
  return (
    schema["type"] === "string" ||
    schema["type"] === "boolean" ||
    schema["type"] === "integer" ||
    schema["type"] === "float"
  );
};

export class SchemaLSP {
  static isObject = (schema: any) => isObject(schema) && (get(schema, "type") === "object" || has(schema, "properties"));
  static isArray = (schema: any) => isObject(schema) && (get(schema, "type") === "array" || has(schema, "items"));

  constructor(private rootSchema: any) {
  }

  defRef(schema: any) {
    if (schema && schema["$ref"]) {
      return get(this.rootSchema, schema["$ref"].slice(2).split("/"));
    }
    return schema;
  }

  resolve(selectionSet: string[]): any[] {
    let found: any[] = [];

    this._visit(
      this.rootSchema,
      selectionSet,
      {
        enter: (s) => {
          found.push(s);
        },
        leave: (s) => {
          found = found.filter(m => s !== m);
        }
      }
    );

    return found.length === 0 ? [this.rootSchema] : found;
  }

  private _visit(
    schema: any,
    selectionSet: string[],
    visitor: {
      enter: (schema: any) => void,
      leave: (schema: any) => void
    }
  ): boolean {
    if (schema && selectionSet) {
      schema = this.defRef(schema);

      visitor.enter(schema);

      if (schema["anyOf"]) {
        for (const sub of schema["anyOf"]) {
          if (this._visit(sub, selectionSet, visitor)) {
            visitor.leave(sub);
            return true;
          }
          visitor.leave(sub);
        }
        visitor.leave(schema);
        return false;
      }

      if (schema["oneOf"]) {
        for (const sub of schema["oneOf"]) {
          if (this._visit(sub, selectionSet, visitor)) {
            visitor.leave(sub);
            return true;
          }
          visitor.leave(sub);
        }
        visitor.leave(schema);
        return false;
      }

      if (SchemaLSP.isArray(schema)) {
        return this._visit(schema["items"], selectionSet, visitor);
      }

      if (SchemaLSP.isObject(schema)) {
        const [first, ...others] = selectionSet as unknown as [
          string,
          ...string[]
        ];

        if (SchemaLSP.isObject(schema["additionalProperties"])) {
          this._visit(schema["additionalProperties"], others, visitor);
          return true;
        }

        const propSchema = get(schema, ["properties", first]);
        if (!propSchema) {
          return false;
        }

        this._visit(propSchema, others, visitor);
        return true;
      }
      return true;
    }
    return false;
  }

  resolveCompletions(
    selectionSet: ReturnType<typeof selectionSetAt>
  ): readonly Completion[] {
    const schema = last(this.resolve(selectionSet.selection));
    if (!schema) {
      return [];
    }
    return this._resolveCompletions(schema, selectionSet);
  }

  private _resolveCompletions(
    schema: any,
    selectionSet: ReturnType<typeof selectionSetAt>
  ): Completion[] {
    if (schema.oneOf) {
      return map(schema.oneOf, (sub) =>
        this._resolveCompletions(sub, selectionSet)
      ).flat(1);
    } else if (schema.anyOf) {
      return map(schema.anyOf, (sub) =>
        this._resolveCompletions(sub, selectionSet)
      ).flat(1);
    } else if (schema.type === "object") {
      const completions: Completion[] = [];

      if (
        !(
          selectionSet.node.name === "Object" ||
          selectionSet.node.name === "PropertyName"
        )
      ) {
        return completions;
      }

      for (const propName in schema.properties) {
        if (selectionSet.properties.includes(propName)) {
          continue;
        }

        const subSchema = this.defRef(schema.properties[propName]);

        const base = {
          label: propName,
          info: subSchema.description
        };

        if (selectionSet.node.name == "Object") {
          let snippetHolder = "";

          switch (subSchema.type) {
            case "object":
              snippetHolder = "{${}}";
              break;
            case "array":
              snippetHolder = "[${}]";
              break;
            case "string":
              snippetHolder = "\"${}\"";
          }

          completions.push(
            snippetCompletion(`"${propName}": ${snippetHolder}`, base)
          );
        } else {
          completions.push(base);
        }
      }
      return completions;
    } else if (isSimpleSchema(schema) && schema.enum) {
      return map(schema.enum, (v) => ({
        label: `${v}`,
        info: schema.description,
        apply: selectionSet.node.name === "String" ? `${v}` : JSON.stringify(v)
      }));
    }

    return [];
  }
}

const completions = (rootSchema: any) => {
  const lsp = new SchemaLSP(rootSchema);

  return (ctx: CompletionContext): CompletionResult | null => {
    let before = ctx.matchBefore(/\w+/);

    if (!ctx.explicit && !before) {
      return null;
    }

    const selectionSet = selectionSetAt(ctx.state, ctx.pos);

    return {
      from: before?.text ? before?.from : ctx.pos,
      options: lsp.resolveCompletions(selectionSet),
      filter: true
    };
  };
};

const getErrorPosition = (error: SyntaxError, state: EditorState) => {
  const m1 = error.message.match(/at position (\d+)/);
  if (m1) {
    return Math.min(parseInt(m1[1]!), state.doc.length);
  }
  const m2 = error.message.match(/at line (\d+) column (\d+)/);
  if (m2) {
    return Math.min(
      state.doc.line(parseInt(m2[1]!)).from + parseInt(m2[2]!) - 1,
      state.doc.length
    );
  }

  return 0;
};

const walkNode = (
  editorState: EditorState,
  node: SyntaxNode | null,
  each: (path: string, node: SyntaxNode) => void,
  path = "/"
) => {
  if (!node) {
    return;
  }

  switch (node.name) {
    case "JsonText":
      walkNode(editorState, node.firstChild, each, path);
      break;
    case "Object":
      each(path, node);

      for (let n = node.firstChild; n != null; n = n.nextSibling) {
        if (n.name == "Property") {
          const propNameNode = n.firstChild;
          const propValueNode = n.lastChild;
          if (propNameNode && propValueNode) {
            const propName = unquote(
              editorState.sliceDoc(propNameNode.from, propNameNode.to)
            );
            each(`${path}${propName}`, propNameNode);
            walkNode(editorState, propValueNode, each, `${path}${propName}/`);
          }
        }
      }
      break;
    case "Array":
      each(path, node);

      let idx = 0;
      for (let n = node.firstChild; n != null; n = n.nextSibling) {
        if (n.name != "[" && n.name != "]") {
          each(`${path}${idx}`, node);
          walkNode(editorState, n, each, `${path}${idx}/`);
          idx++;
        }
      }
      break;
    default:
  }
};

const validateErrorsToDiagnostics = (
  errorSet: { [K: string]: string },
  editorState: EditorState
): Diagnostic[] => {
  if (Object.keys(errorSet).length == 0) {
    return [];
  }

  const diagnostics: Diagnostic[] = [];

  walkNode(editorState, syntaxTree(editorState).topNode, (path, node) => {
    const msg = errorSet[path];
    if (msg) {
      diagnostics.push({
        from: node.from,
        to: path.endsWith("/") ? node.from + 1 : node.to,
        severity: "error",
        message: errorSet[path]!
      });
    }
  });

  return diagnostics;
};

const jsonLinter = (options: { schema?: any } = {}) => {
  const validate = createValidator(options.schema);

  return (view: EditorView): Diagnostic[] => {
    try {
      const object = JSON.parse(view.state.doc.toString());

      if (validate) {
        return validateErrorsToDiagnostics(validate(object), view.state);
      }
    } catch (e) {
      if (!(e instanceof SyntaxError)) {
        throw e;
      }

      const pos = getErrorPosition(e, view.state);

      return [
        {
          from: pos,
          severity: "error",
          message: e.message,
          to: pos
        }
      ];
    }

    return [];
  };
};

export const useJSONEditor = (schema: any = {}) => {
  return useExtension(() => {
    return [
      linter(jsonLinter({ schema: schema })),
      autocompletion({
        override: [completions(schema)]
      }),
      keymap.of([
        {
          key: "Shift-Space",
          run: startCompletion
        }
      ]),
      json(),
      keymap.of([indentWithTab])
    ];
  }, [schema]);
};


export const useJSONEditorReadOnly = () => {
  return useExtension(() => {
    return [
      EditorState.readOnly.of(true),
      json()
    ];
  }, []);
};

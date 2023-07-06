import {
  autocompletion,
  CompletionContext,
  type CompletionResult,
  startCompletion,
} from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { json } from "@codemirror/lang-json";
import { syntaxTree } from "@codemirror/language";
import { type Diagnostic, linter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { LSP } from "@nodepkg/jsonschema";
import { useExtension } from "../EditorContextProvider";
import { JSONCompletion } from "./JSONCompletion";
import { walkNode } from "./util";

const completions = (rootSchema: any) => {
  const jc = new JSONCompletion(LSP.create(rootSchema));

  return (ctx: CompletionContext): CompletionResult | null => {
    let before = ctx.matchBefore(/\w+/);

    if (!ctx.explicit && !before) {
      return null;
    }

    return {
      from: before?.text ? before?.from : ctx.pos,
      options: jc.completionsAt(ctx.state, ctx.pos),
      filter: true,
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
      state.doc.length,
    );
  }

  return 0;
};

const validateErrorsToDiagnostics = (
  errorSet: { [K: string]: string },
  editorState: EditorState,
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
        to: node.to,
        severity: "error",
        message: errorSet[path]!,
      });
    }
  });

  return diagnostics;
};

const jsonLinter = (options: { schema?: any } = {}) => {
  const lsp = LSP.create(options.schema || {});

  return (view: EditorView): Diagnostic[] => {
    try {
      const object = JSON.parse(view.state.doc.toString());
      return validateErrorsToDiagnostics(lsp.validate(object), view.state);
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
          to: pos,
        },
      ];
    }
  };
};

export const useJSONEditor = (schema: any) => {
  return useExtension(() => [
    linter(jsonLinter({ schema: schema })),
    autocompletion({
      override: [completions(schema)],
    }),
    json(),
    keymap.of([
      {
        key: "Shift-Space",
        shift: startCompletion,
      },
    ]),
    keymap.of([indentWithTab]),
  ]);
};

export const useJSONEditorReadOnly = () => {
  return useExtension(() => {
    return [EditorState.readOnly.of(true), json()];
  });
};

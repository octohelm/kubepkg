import { EditorState } from "@codemirror/state";
import { type SyntaxNode } from "@lezer/common";

const unquote = (s: string) => {
  try {
    return JSON.parse(s);
  } catch (_) {
    return s;
  }
};

export const walkNode = (
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

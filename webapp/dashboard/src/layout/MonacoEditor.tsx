// @ts-ignore
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
// @ts-ignore
import JSONWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new JSONWorker();
    }
    return new EditorWorker();
  },
};

export { default as Editor } from "@monaco-editor/react";

import { useState } from "react";
import { useObservableEffect } from "@innoai-tech/reactutil";
import { from, tap } from "rxjs";
import { Box, GlobalStyles, SxProps, Theme } from "@mui/material";
import type { editor, languages, Uri } from "monaco-editor";
import { loader, default as Editor } from "@monaco-editor/react";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return import(
        // @ts-ignore
        "monaco-editor/esm/vs/language/json/json.worker?worker"
        ).then(({ default: JSONWorker }) => new JSONWorker());
    }
    return import(
      // @ts-ignore
      "monaco-editor/esm/vs/editor/editor.worker?worker"
      ).then(({ default: EditorWorker }) => new EditorWorker());
  }
};

export type Monaco = {
  editor: typeof editor;
  Uri: typeof Uri;
  languages: typeof languages;
};

export interface MonacoEditorProps {
  sx?: SxProps<Theme>;
  defaultValue?: string;
  value?: string;
  onChange: (value: string) => void;
  path: string;
  language: string;
  options: editor.IStandaloneEditorConstructionOptions;
  beforeMount?: (m: Monaco) => void;
}

export const MonacoEditor = (props: MonacoEditorProps) => {
  const [monaco, setMonaco] = useState<{ m: Monaco | null; css: string }>({
    m: null,
    css: ""
  });

  useObservableEffect(() => {
    return from(
      Promise.all([
        // @ts-ignore
        import("monaco-editor/esm/vs/editor/edcore.main"),
        // @ts-ignore
        import("monaco-editor/esm/vs/language/json/monaco.contribution")
      ])
    ).pipe(
      tap(([monaco]) => {
        setMonaco({
          m: monaco,
          css: ""
        });
        loader.config({ monaco });
      })
    );
  }, []);

  return monaco.m ? (
    <Box sx={props.sx}>
      {monaco.css && <GlobalStyles styles={monaco.css} />}
      <Editor
        options={props.options}
        language={props.language}
        path={props.path}
        value={props.value}
        defaultValue={props.defaultValue}
        theme={props.options.theme}
        beforeMount={props.beforeMount}
        onChange={(v) => props.onChange(v || "")}
      />
    </Box>
  ) : null;
};

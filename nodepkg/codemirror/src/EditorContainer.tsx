import { defaultHighlightStyle, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { Box, useTheme, alpha } from "@mui/material";
import { useEditorView, useExtension } from "./EditorContextProvider";

export const useEditorHighlightStyle = () => {
  const { palette } = useTheme();

  return useExtension(() => {
    const style = HighlightStyle.define([
      ...defaultHighlightStyle.specs,
      {
        tag: tags.propertyName,
        color: palette.warning.main
      },
      {
        tag: tags.string,
        color: palette.success.main
      }
    ]);

    return syntaxHighlighting(style, { fallback: true });
  }, [palette]);
};


export const EditorContainer = () => {
  useEditorHighlightStyle();

  const containerRef = useEditorView();
  const theme = useTheme();

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        fontSize: theme.typography.body2.fontSize,
        "& .cm-editor": {
          outline: "none",
          height: "100%",
          "& .cm-gutterElement": {
            color: alpha(theme.palette.text.secondary, 0.3)
          },
          "& [aria-readonly=true]": {
            opacity: 0.7
          },
          "& .cm-activeLineGutter": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08)
          },
          "& .cm-activeLine": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08)
          },
          "& .cm-tooltip-autocomplete ul li[aria-selected]": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
          },
          "& .cm-gutters": {
            border: "none",
            backgroundColor: theme.palette.background.paper
          },
          "& .cm-tooltip": {
            fontFamily: "monospace",
            border: "none",
            backgroundColor: theme.palette.background.paper,
            boxShadow: 2,
            borderRadius: 1
          },
          "& .cm-tooltip-lint": {
            overflow: "hidden"
          },
          "& .cm-tooltip-hover": {
            overflow: "hidden"
          }
        }
      }}
    />
  );
};
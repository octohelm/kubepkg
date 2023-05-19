import { rx, subscribeOnMountedUntilUnmount } from "@nodepkg/runtime";
import { styled, variant, alpha } from "@nodepkg/ui";
import { syntaxHighlighting } from "@codemirror/language";
import { EditorContextProvider, useExtension } from "./EditorContextProvider";
import { classHighlighter } from "@lezer/highlight";

export const EditorContainer = styled("div", () => {
  const ctx = EditorContextProvider.use();

  useExtension(() => {
    return syntaxHighlighting(classHighlighter, { fallback: true });
  });

  rx(ctx.serve(), subscribeOnMountedUntilUnmount());

  return (Root) => (
    <Root>
      <div data-editor-container={""} ref={ctx.dom$}></div>
    </Root>
  );
})({
  width: "100%",
  height: "100%",
  fontSize: 12,

  "& .cm-editor": {
    outline: "none",
    height: "100%",
    "& .cm-gutterElement": {
      color: "sys.secondary",
    },
    "& [aria-readonly=true]": {
      opacity: 0.7,
    },
    "& .cm-activeLineGutter": {
      backgroundColor: variant("sys.primary", alpha(0.08)),
    },
    "& .cm-activeLine": {
      backgroundColor: variant("sys.primary", alpha(0.08)),
    },

    "& .diffLineGutter": {
      backgroundColor: variant("sys.error", alpha(0.08)),
    },
    "& .diffLine": {
      backgroundColor: variant("sys.error", alpha(0.08)),
    },

    "& .cm-tooltip-autocomplete ul li[aria-selected]": {
      containerStyle: "sys.primary",
    },
    "& .cm-gutters": {
      border: "none",
      backgroundColor: "rgba(0,0,0,0)",
    },
    "& .cm-tooltip": {
      border: "none",
      boxShadow: "2",
      borderRadius: "xs",
      containerStyle: "sys.surface-container-lowest",
      fontFamily: "code",
    },
    "& .cm-tooltip-lint": {
      overflow: "hidden",
    },
    "& .cm-tooltip-hover": {
      overflow: "hidden",
    },
  },
  "& .tok-propertyName": {
    color: "sys.primary",
  },
  "& .tok-number": {
    color: "sys.error",
  },
  "& .tok-keyword": {
    color: "sys.error",
  },
  "& .tok-string": {
    color: "sys.tertiary",
  },
  "& .tok-punctuation": {
    color: variant("sys.primary", alpha(0.38)),
  },
});

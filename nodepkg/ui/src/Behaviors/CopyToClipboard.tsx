import { t, type VNodeChild } from "@nodepkg/runtime";
import { styled } from "@innoai-tech/vueuikit";
import copy from "copy-to-clipboard";

export const CopyToClipboard = styled(
  "div",
  {
    content: t.string(),
    onDidCopy: t.custom<() => void>(),
    $default: t.custom<VNodeChild>(),
  },
  (props, { slots, emit }) => {
    return (Wrap) => {
      return (
        <Wrap
          onClick={() => {
            copy(props.content, {});
            emit("did-copy");
          }}
        >
          {slots.default?.()}
        </Wrap>
      );
    };
  }
)({
  cursor: "pointer",
});

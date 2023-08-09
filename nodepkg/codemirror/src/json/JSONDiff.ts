import {
  Decoration,
  type DecorationSet,
  EditorView,
  gutterLineClass,
  GutterMarker,
  ViewUpdate
} from "@codemirror/view";
import { useExtension } from "../EditorContextProvider";
import { isUndefined, isPlainObject, isEqual } from "@nodepkg/runtime/lodash";
import {
  type Extension,
  Range,
  RangeSet,
  StateEffect,
  StateField
} from "@codemirror/state";
import { walkNode } from "./util";
import { ensureSyntaxTree } from "@codemirror/language";
import { JSONPointer } from "./JSONPointer";

const addDiffLineEffect = StateEffect.define<{
  type?: "m" | "d" | "a";
  from: number;
  to: number;
}>({});

const removeDiffLineEffect = StateEffect.define<{
  from: number;
  to: number;
}>({});

// FIXME support "d" | "a"
const diffLine = Decoration.line({ class: "diffLine" });

const diffLineGutter = /*@__PURE__*/ new (class extends GutterMarker {
  constructor() {
    super();
    this.elementClass = "diffLineGutter";
  }
})();

const diffedLines = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(lines, tr) {
    tr.effects.forEach((e) => {
      if (e.is(addDiffLineEffect)) {
        lines = lines.update({
          add: [diffLine.range(e.value.from, e.value.to)]
        });
      } else if (e.is(removeDiffLineEffect)) {
        lines = cutRange(lines, e.value);
      }
    });

    return lines.update({
      filterFrom: 0,
      filterTo: tr.newDoc.length,
      filter: () => true
    });
  },
  provide: (f) => EditorView.decorations.from(f)
});

function cutRange(ranges: DecorationSet, r: { from: number; to: number }) {
  let leftover: Range<any>[] = [];

  ranges.between(r.from, r.to, (from, to, deco) => {
    if (from < r.from) leftover.push(deco.range(from, r.from));
    if (to > r.to) leftover.push(deco.range(r.to, to));
  });

  return ranges.update({
    filterFrom: r.from,
    filterTo: r.to,
    filter: () => false,
    add: leftover
  });
}

const jsonDiff = (base: () => any): Extension[] => {
  return [
    diffedLines,
    gutterLineClass.compute([diffedLines], (state) => {
      const c = state.field(diffedLines).iter();
      const markers: Range<GutterMarker>[] = [];
      while (c.value != null) {
        markers.push(diffLineGutter.range(c.from, c.to));
        c.next();
      }
      return RangeSet.of(markers);
    }),
    EditorView.updateListener.of((v: ViewUpdate) => {
      if (v.viewportChanged || v.docChanged) {
        diffAndDispatchEffects(v, base());
      }
    })
  ];
};

const diffAndDispatchEffects = (v: ViewUpdate, src: string) => {
  let modified = "";
  try {
    modified = JSON.parse(v.view.state.doc.toString());
  } catch (e) {
    // console.log(e);
  }

  if (!modified) {
    return;
  }

  const diffRet = diff(modified, src);

  if (diffRet.size == 0) {
    return;
  }

  const tree = ensureSyntaxTree(v.state, v.view.viewport.to);

  if (!tree) {
    return;
  }

  const effects: Array<ReturnType<typeof addDiffLineEffect.of>> = [];
  const newLines = new Set<number>();

  let last = -1;

  walkNode(v.state, tree.topNode, (path, node) => {
    if (diffRet.has(path)) {
      const [type] = diffRet.get(path)!;

      let endNode = node;

      if (node.type.name == "PropertyName") {
        if (node.nextSibling) {
          endNode = node.nextSibling;
        }
      }

      const lineStartPos = v.view.lineBlockAt(node.from).from;
      const lineEndPos = v.view.lineBlockAt(endNode.to).from;

      if (lineEndPos > last) {
        last = lineEndPos;

        for (let linePos = lineStartPos; linePos <= lineEndPos; linePos++) {
          effects.push(
            addDiffLineEffect.of({
              type,
              from: linePos,
              to: linePos
            })
          );
          newLines.add(linePos);
        }
      }
    }
  });

  const c = v.state.field(diffedLines).iter();
  while (c.value != null) {
    if (!newLines.has(c.from)) {
      effects.push(removeDiffLineEffect.of({ from: c.from, to: c.to }));
    }
    c.next();
  }

  v.view.dispatch({ effects });
};

export const useJSONDiff = (src: () => any) => {
  return useExtension(() => [jsonDiff(src)]);
};

export function diff(newValue: any, oldValue: any) {
  const d = new JSONDiff();

  d.diff(newValue, oldValue, []);

  return d.ret;
}

class JSONDiff {
  ret = new Map<string, ["m" | "d" | "a", ...any[]]>();

  mark(path: any[], type: "m" | "d" | "a", right: any, left: any) {
    this.ret.set(JSONPointer.compile(path), [type, right, left]);
  }

  diff(r: any, l: any, path: any[] = []) {
    if (isPlainObject(r) && isPlainObject(l)) {
      const visited = new Set<string>();

      for (const p in r) {
        visited.add(p);

        const rr = r[p]!;
        const ll = l[p];

        this.diff(rr, ll, [...path, p]);
      }

      for (const p in l) {
        if (!visited.has(p)) {
          const ll = l[p];
          this.mark([...path, p], "d", undefined, ll);
        }
      }

      return;
    }

    if (isUndefined(l)) {
      this.mark(path, "a", r, l);
      return;
    }

    if (!isEqual(l, r)) {
      this.mark(path, "m", r, l);
    }
  }
}

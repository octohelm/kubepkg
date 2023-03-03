import {
  bracketMatching,
  closeBrackets,
  closeBracketsKeymap,
  defaultKeymap,
  EditorView,
  foldGutter,
  foldKeymap,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  lintGutter,
  lintKeymap,
  Extension,
  history,
  historyKeymap,
  EditorState
} from "./codemirror";
import { useEffect, useRef } from "react";
import {
  BehaviorSubject,
  combineLatest,
  map,
  merge,
  of,
  switchMap
} from "rxjs";
import { createProvider, tapEffect } from "@nodepkg/runtime";
import { useObservableEffect } from "@innoai-tech/reactutil";

export const EditorContextProvider = createProvider(
  ({ doc }: { doc?: string }) => {
    const base = (): Extension[] => [
      lintGutter(),
      keymap.of(lintKeymap),

      lineNumbers(),

      // fold
      foldGutter({
        openText: String.fromCharCode(0x25be),
        closedText: String.fromCharCode(0x25b8)
      }),
      keymap.of(foldKeymap),

      // bracket
      bracketMatching(),
      closeBrackets(),
      keymap.of(closeBracketsKeymap),

      // highlight
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      highlightActiveLine(),

      history(),
      keymap.of(historyKeymap),
      keymap.of(defaultKeymap)
    ];

    const extension$ = new BehaviorSubject<Array<() => Extension>>([]);

    const doc$ = new BehaviorSubject<string>(doc || "");
    const dom$ = new BehaviorSubject<HTMLDivElement | null>(null);
    const view$ = new BehaviorSubject<EditorView | null>(null);

    const state$ = combineLatest([doc$, extension$]).pipe(
      map(([doc, extensions]) =>
        EditorState.create({
          doc,
          extensions: [...extensions, base].map((e) => e())
        })
      )
    );

    return {
      doc$,
      state$,
      dom$,
      view$,
      use: (createExtension: () => Extension) => {
        extension$.next([...extension$.value, createExtension]);
        return () => {
          extension$.next(
            extension$.value.filter((b) => b !== createExtension)
          );
        };
      },
      serve: () =>
        merge(
          state$,
          combineLatest([dom$, state$]).pipe(
            switchMap(([container, state]) => {
              if (container == null) {
                return of(null);
              }
              return of(
                new EditorView({
                  parent: container,
                  state: state
                })
              );
            }),
            tapEffect((view) => {
              view$.next(view);
              return () => view?.destroy();
            })
          )
        )
    };
  }
);

export const useExtension = (
  createExtension: () => Extension,
  deps: any[] = []
) => {
  const state = EditorContextProvider.use();
  useEffect(() => state.use(createExtension), deps);
};

export const useEditorView = () => {
  const ctx = EditorContextProvider.use();
  const containerRef = useRef<HTMLDivElement>(null);

  useObservableEffect(ctx.serve());

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    ctx.dom$.next(containerRef.current);
    return () => {
      ctx.dom$.next(null);
    };
  }, []);

  return containerRef;
};

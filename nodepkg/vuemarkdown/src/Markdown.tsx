import {
  rx,
  t,
  component$,
  type Component,
  type VNode
} from "@nodepkg/runtime";
import { combineLatest, from, switchMap, map } from "@nodepkg/runtime/rxjs";
import { unified, remarkRehype, remarkParse, rehypeVue } from "./unified";

export const Markdown = component$(
  {
    text: t.string(),
    components: t.record(t.string(), t.custom<Component<any>>()).optional()
  },
  (props, { render }) => {
    const processor$ = props.components$.pipe(
      map((components) =>
        unified()
          .use(remarkParse as any)
          .use(remarkRehype as any)
          .use(rehypeVue, { components: components ?? {} })
      )
    );

    return rx(
      combineLatest([processor$, props.text$]),
      switchMap(([processor, text]) => from(processor.process(text))),
      render((vfile: any) => vfile.result as VNode)
    );
  }
);

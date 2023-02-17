import { createElement, Fragment, useState } from "react";
import { useObservableEffect } from "@innoai-tech/reactutil";
import { from, switchMap, tap } from "rxjs";

export const Markdown = ({ children }: { children: string }) => {
  const [Content, setContent] = useState(<></>);

  useObservableEffect(() => {
    return from(import("./unified")).pipe(
      switchMap(({ unified, remarkRehype, remarkParse, rehypeReact }) => {
        return unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeReact, { createElement, Fragment })
          .process(children);
      }),
      tap((file) => {
        setContent(file.result);
      })
    );
  }, [children]);

  return Content;
};

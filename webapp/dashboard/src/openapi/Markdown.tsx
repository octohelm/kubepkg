import { createElement, Fragment, useState } from "react";
import { useObservableEffect } from "@innoai-tech/reactutil";
import { from, map } from "rxjs";

export const Markdown = ({ children }: { children: string }) => {
  const [Content, setContent] = useState(<></>);

  useObservableEffect(() => {
    return from(
      Promise.all([
        import("unified"),
        import("rehype-parse"),
        import("rehype-react"),
      ]).then(
        ([{ unified }, { default: rehypeParse }, { default: rehypeReact }]) =>
          unified()
            .use(rehypeParse, { fragment: true })
            .use(rehypeReact, { createElement, Fragment })
            .process(children)
      )
    ).pipe(
      map((file) => {
        setContent(file.result);
      })
    );
  }, [children]);

  return Content;
};

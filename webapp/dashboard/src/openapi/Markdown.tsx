import { createElement, Fragment, useEffect, useState } from "react";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";

export const Markdown = ({ children }: { children: string }) => {
  const [Content, setContent] = useState(<></>);

  useEffect(() => {
    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeReact, { createElement, Fragment })
      .process(children)
      .then((file) => {
        setContent(file.result);
      });
  }, [children]);

  return Content;
};

import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";

export const bootstrap = ($root: HTMLElement, element: ReactElement) => {
  const root = createRoot($root);
  return root.render(element);
};
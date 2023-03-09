export const stringify = {
  dynamicImport: (path: string) => `(() => {
    const fetch = () => import("${path}");
    const C = lazy(fetch);
    C.fetch = fetch;
    return C;
  })()`,
  component: (ComponentName: string) => ` jsx(${ComponentName}, {})`,
  final: (code: string) => `import { lazy } from "react";
import { jsx } from "react/jsx-runtime";  
${code}
`
};
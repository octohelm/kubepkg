import { component, useRoute } from "@nodepkg/runtime";
import { OpenAPIPlayground } from "@nodepkg/openapi-playground";

export default component(() => {
  const r = useRoute();
  return () => {
    const spec = r.query["spec"] as string;
    return <OpenAPIPlayground spec={spec} />;
  };
});

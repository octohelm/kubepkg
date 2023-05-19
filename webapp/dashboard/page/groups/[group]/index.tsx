import { component, t } from "@nodepkg/runtime";

export default component(
  {
    group: t.string()
  },
  () => {
    return () => {
      return (
        <div></div>
      );
    };
  }
);

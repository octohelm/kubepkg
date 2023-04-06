import { styled, Icon, mdiKubernetes } from "@nodepkg/ui";

export const Logo = styled("h1", {}, () => {
  return (Wrap) => (
    <Wrap>
      <Icon path={mdiKubernetes} />
      <div data-text={""}>
        <small>KubePkg</small>
        <span>Dashboard</span>
      </div>
    </Wrap>
  );
})({
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "sys.primary",
  "& [data-text]": {
    display: "flex",
    flexDirection: "column",
    textStyle: "sys.title-medium",
    "& small": {
      textStyle: "sys.body-small",
      mb: -4,
      opacity: 0.38
    }
  }
});

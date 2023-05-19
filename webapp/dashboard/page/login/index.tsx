import { styled, Box } from "@nodepkg/ui";
import { LoginCard, MustLogout } from "@webapp/dashboard/mod/auth";

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  w: "100vw",
  h: "100vh",
  containerStyle: "sys.surface-container-lowest"
});

export default () => (
  <MustLogout>
    <Container>
      <LoginCard />
      <Box sx={{ height: "20vh" }} />
    </Container>
  </MustLogout>
);
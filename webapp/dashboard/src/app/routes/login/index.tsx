import { Container } from "@mui/material";
import { LoginCard, MustLogout } from "src/auth";

const PageLogin = () => (
  <Container
    component="main"
    maxWidth="xs"
    sx={{
      marginTop: 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}
  >
    <LoginCard />
  </Container>
);

export default () => (
  <MustLogout>
    <PageLogin />
  </MustLogout>
);
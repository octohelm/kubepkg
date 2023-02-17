import { Container } from "@mui/material";
import { Route } from "@nodepkg/router";
import { AuthorizeCallback, LoginCard, MustLogout } from "../../auth";

const LoginPage = () => (
  <Container
    component="main"
    maxWidth="xs"
    sx={{
      marginTop: 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <LoginCard />
  </Container>
);

export const loginRoutes = (
  <Route>
    <Route
      path={"login"}
      element={
        <MustLogout>
          <LoginPage />
        </MustLogout>
      }
    />
    <Route path={"authorize/callback/:name"} element={<AuthorizeCallback />} />
  </Route>
);

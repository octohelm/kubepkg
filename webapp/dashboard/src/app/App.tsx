import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Link, Routes } from "react-router-dom";
import {
  index,
  Main,
  NotificationProvider,
  NotificationSnackbar,
  path,
  Scaffold,
} from "../layout";
import { loginRoutes } from "./login";
import { adminRoutes, groupRoutes } from "./Routes";
import { GroupCardList } from "../group";
import { IconButtonWithTooltip } from "../layout";
import { Build } from "@mui/icons-material";
import { MustLogon } from "../auth";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

const mainRoutes = path("/")
  .element(
    <MustLogon>
      <Main title={"Kubepkg Dashboard"} />
    </MustLogon>
  )
  .children(
    index().element(
      <Scaffold
        toolbar={
          <IconButtonWithTooltip
            label="系统管理"
            color="inherit"
            component={Link}
            to={"/admin"}
          >
            <Build />
          </IconButtonWithTooltip>
        }
      >
        <GroupCardList />
      </Scaffold>
    ),
    groupRoutes,
    adminRoutes
  )();

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <Routes>
          ${loginRoutes}${mainRoutes}
        </Routes>
        <NotificationSnackbar />
      </NotificationProvider>
    </ThemeProvider>
  );
};

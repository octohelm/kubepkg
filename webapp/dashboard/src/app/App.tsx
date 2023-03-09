import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import {
  createBrowserRouter,
  processRoutes,
  RouterProvider
} from "@nodepkg/router";
import { NotificationProvider, NotificationSnackbar } from "src/layout";

// @ts-ignore
import routes from "~react-pages";

const router = createBrowserRouter(processRoutes(routes), {
  basename: `${document.querySelector("base")?.getAttribute("href") ?? "/"}`
});

const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5"
    },
    secondary: {
      main: "#f50057"
    }
  }
});

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <RouterProvider router={router} />
        <NotificationSnackbar />
      </NotificationProvider>
    </ThemeProvider>
  );
};

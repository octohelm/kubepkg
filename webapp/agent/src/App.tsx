import {
  Box,
  createTheme,
  CssBaseline,
  Stack,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { KubePkgQuerier } from "./kubepkg";

const theme = createTheme();

export const App = () => {
  const maxWidthMatched = useMediaQuery("(max-width:600px)");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack
        component="main"
        sx={{
          display: "flex",
          flexDirection: maxWidthMatched ? "column" : "row",
          overflow: "hidden",
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          p: maxWidthMatched ? 2 : 4,
          backgroundColor: "grey.200",
        }}
        gap={maxWidthMatched ? 2 : 4}
      >
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <KubePkgQuerier />
        </Box>
      </Stack>
    </ThemeProvider>
  );
};

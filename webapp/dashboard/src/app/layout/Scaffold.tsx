import type { ReactNode } from "react";
import { Box, AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "@nodepkg/router";
import { TopNavDrawer } from "./TopNavDrawer";

export interface ScaffoldProps {
  action?: ReactNode;
  toolbar?: ReactNode;
  children?: ReactNode;
}

export const Scaffold = ({ toolbar, action, children }: ScaffoldProps) => {
  const sidebarWidth = 240;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        overflow: "hidden"
      }}
    >
      <Box>
        <AppBar
          color="primary"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            position: "relative"
          }}
        >
          <Toolbar>
            <Box sx={{ width: sidebarWidth }}>
              <Typography
                variant="h6"
                noWrap={true}
                component="div"
                sx={{ flexGrow: 1 }}
              >
                <Button
                  variant="text"
                  component={Link}
                  to={"/"}
                  sx={{ color: "inherit" }}
                >
                  KubePkg Dashboard
                </Button>
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>{action}</Box>
            {toolbar}
          </Toolbar>
        </AppBar>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden"
        }}
      >
        <TopNavDrawer width={sidebarWidth} />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            position: "relative",
            overflow: "auto",
            backgroundColor: "background.default"
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

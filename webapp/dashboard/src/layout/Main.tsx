import { Fragment, ReactElement, useMemo } from "react";
import { ListItemLink, useRoutes } from "./Route";
import {
  Divider,
  Box,
  Drawer,
  List,
  Toolbar,
  AppBar,
  Typography,
  Button,
} from "@mui/material";
import { Link, Outlet, useMatch, generatePath } from "react-router-dom";
import { ScaffoldProps, ScaffoldProvider } from "./Scaffold";
import { isEmpty } from "@innoai-tech/lodash";

const GlobalDrawer = ({
  width,
  open = true,
}: {
  width: number;
  open?: boolean;
}) => {
  const r = useRoutes();
  const matched = useMatch(r.path);

  return r.children.length === 0 ? null : (
    <Drawer
      open={open}
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        ["& .MuiDrawer-paper"]: { width, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <Divider />
      {r.meta.title && (
        <>
          <List>{r.meta.title}</List>
          <Divider />
        </>
      )}
      <List>
        {r.children.map((item) => {
          if (isEmpty(item.children)) {
            return (
              <ListItemLink
                key={item.path}
                icon={item.icon}
                title={item.title}
                to={generatePath(item.path, matched?.params)}
              />
            );
          }

          return (
            <Fragment key={item.path}>
              <ListItemLink
                icon={item.icon}
                title={item.title}
                to={generatePath(item.path, matched?.params)}
              />
              {item.children.map((sub, i) => {
                if (sub.menu) {
                  return <Fragment key={i}>{sub.menu}</Fragment>;
                }

                return (
                  <ListItemLink
                    key={i}
                    title={sub.title}
                    to={generatePath(sub.path, {
                      ...matched?.params,
                      env: "test",
                    })}
                  />
                );
              })}
            </Fragment>
          );
        })}
      </List>
      <Box flex={1} />
    </Drawer>
  );
};

export const Main = ({ title }: { title: string | ReactElement }) => {
  const Scaffold = useMemo(
    () =>
      ({ toolbar, action, children }: ScaffoldProps) => {
        const sidebarWidth = 240;

        return (
          <Box sx={{ display: "flex" }}>
            <AppBar
              color="primary"
              sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
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
                      {title}
                    </Button>
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>{action}</Box>
                {toolbar}
              </Toolbar>
            </AppBar>
            <GlobalDrawer width={sidebarWidth} />
            <Box
              component="main"
              sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
            >
              <Toolbar />
              {children}
            </Box>
          </Box>
        );
      },
    []
  );

  return (
    <ScaffoldProvider value={{ Scaffold }}>
      <Outlet />
    </ScaffoldProvider>
  );
};

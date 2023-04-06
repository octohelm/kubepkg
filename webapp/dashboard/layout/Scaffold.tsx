import {
  Box,
  Icon,
  IconButton,
  Tooltip,
  mdiWhiteBalanceSunny,
  mdiWeatherNight,
  styled,
  NotificationView
} from "@nodepkg/ui";
import {
  component,
  RouterLink,
  rx,
  toComputed,
  createProvider,
  component$
} from "@nodepkg/runtime";
import { t, type VNodeChild, persist } from "@nodepkg/runtime";
import { BehaviorSubject } from "@nodepkg/runtime/rxjs";
import { LogoutBtn } from "@webapp/dashboard/mod/auth";
import { TopNav } from "./TopNav";
import { Logo } from "./Logo";

const ThemeConfigProvider = createProvider(
  () => {
    return persist(
      "theme",
      (v: any) =>
        new BehaviorSubject<{ mode: "light" | "dark" }>(v ?? { mode: "light" })
    );
  },
  {
    name: "ThemeConfig"
  }
);

export const Scaffold = component(
  {
    $fab: t.custom<VNodeChild>().optional(),
    $toolbar: t.custom<VNodeChild>().optional(),
    $action: t.custom<VNodeChild>().optional(),
    $default: t.custom<VNodeChild>().optional()
  },
  ({}, { slots }) => {
    return () => (
      <ThemeConfigProvider>
        <ScaffoldContainer>
          <ScaffoldAppBar>
            <ScaffoldTitle component={RouterLink} to={"/"} sx={{ w: 240 }}>
              <Logo />
            </ScaffoldTitle>
            <Box sx={{ flex: 1 }}>{slots.toolbar?.()}</Box>
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              {slots.action?.()}
              <ThemeToggleBtn />
              <LogoutBtn />
            </Box>
          </ScaffoldAppBar>
          <Box
            sx={{
              display: "flex",
              height: "100vh",
              overflowY: "auto"
            }}
          >
            <Box sx={{ w: 240 }}>
              <TopNav />
            </Box>
            <ScaffoldMain>{slots.default?.()}</ScaffoldMain>
          </Box>
          {slots.fab && <FAB>{slots.fab?.()}</FAB>}
        </ScaffoldContainer>
        <NotificationView />
      </ThemeConfigProvider>
    );
  }
);

const ThemeToggleBtn = component$(({}, { render }) => {
  const theme$ = ThemeConfigProvider.use();

  return rx(
    theme$,
    render((theme) => {
      return (
        <Tooltip
          title={theme?.mode == "light" ? "切换到深色主题" : "切换到浅色主题"}
        >
          <IconButton
            onClick={() => {
              theme$.next({
                mode: theme$.value.mode == "light" ? "dark" : "light"
              });
            }}
          >
            <Icon
              path={
                theme?.mode == "light" ? mdiWeatherNight : mdiWhiteBalanceSunny
              }
            />
          </IconButton>
        </Tooltip>
      );
    })
  );
});

const FAB = styled("div")({
  pos: "absolute",
  right: 48,
  bottom: 48
});

const ScaffoldContainer = styled(
  "div",
  {
    $default: t.custom<VNodeChild>().optional()
  },
  (_, { slots }) => {
    const theme$ = ThemeConfigProvider.use();

    const theme = rx(theme$, toComputed());

    return (Wrap) => {
      return <Wrap data-theme={theme.value?.mode}>{slots.default?.()}</Wrap>;
    };
  }
)({
  display: "flex",
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
  flexDirection: "column",
  containerStyle: "sys.surface-container-low"
});

const ScaffoldAppBar = styled("div")({
  display: "flex",
  alignItems: "center",
  h: 64,
  p: 16
});

const ScaffoldTitle = styled("div")({
  textStyle: "sys.title-medium",
  textTransform: "uppercase",
  textDecoration: "none",
  px: 8
});

const ScaffoldMain = styled(
  "div",
  {
    $default: t.custom<VNodeChild>().optional()
  },
  ({}, { slots }) =>
    (Wrap) =>
      (
        <Wrap>
          <div data-wrap="">
            <main>{slots.default?.()}</main>
          </div>
        </Wrap>
      )
)({
  px: 16,
  pb: 16,
  flex: 1,
  overflow: "hidden",
  display: "flex",
  rounded: "md",
  flexDirection: "column",
  "& [data-wrap]": {
    containerStyle: "sys.surface",
    rounded: "md",
    flex: 1,
    overflow: "hidden",
    display: "flex"
  },
  "& main": {
    flex: 1,
    overflow: "auto"
  }
});

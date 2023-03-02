import {
  Box,
  useTheme
} from "@mui/material";
import type { ReactNode } from "react";

export const Label = (
  { children }: { children?: ReactNode }
) => {
  const theme = useTheme();

  return (
    <Box
      component="span"
      sx={{
        backgroundColor: theme.palette.info.main,
        color: theme.palette.info.contrastText,
        borderRadius: 1,
        fontSize: "0.6em",
        px: "8px",
        py: "2px",
        mx: 1
      }}
    >
      {children}
    </Box>
  );
};
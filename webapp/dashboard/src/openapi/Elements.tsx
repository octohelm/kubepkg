import { Box } from "@mui/material";
import { getCodeColor, getMethodColor } from "./Colors";

export const HttpCode = ({ code, ...otherProps }: { code: number }) => (
  <Box
    {...otherProps}
    sx={{
      color: getCodeColor(code),
      fontFamily: "monospace",
      fontWeight: "bold",
    }}
  >
    {code}
  </Box>
);

export const HTTPMethod = ({ method, ...otherProps }: { method: string }) => (
  <Box
    {...otherProps}
    component={"span"}
    sx={{
      color: getMethodColor(method),
      fontFamily: "monospace",
      textTransform: "uppercase",
      fontWeight: "bold",
    }}
  >
    {String(method).slice(0, 3)}
  </Box>
);

export const Section = ({
  title,
  children,
}: {
  title?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <Box>
    {title && <Box sx={{ fontWeight: "bold", px: 3, py: 2 }}>{title}</Box>}
    <Box
      sx={{
        px: 3,
      }}
    >
      {children}
    </Box>
  </Box>
);

import {
  IconButton,
  IconButtonProps,
  IconButtonTypeMap,
  Tooltip,
} from "@mui/material";
import { forwardRef } from "react";

export const IconButtonWithTooltip = forwardRef(
  <
    D extends React.ElementType = IconButtonTypeMap["defaultComponent"],
    P extends {} = {}
  >(
    { title, children, ...props }: IconButtonProps<D, P & { title: string }>,
    ref: any
  ) => {
    return (
      <Tooltip title={title}>
        <IconButton ref={ref} size="normal" aria-label={title} {...props}>
          {children}
        </IconButton>
      </Tooltip>
    );
  }
);

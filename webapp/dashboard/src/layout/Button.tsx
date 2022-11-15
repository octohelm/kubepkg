import {
  IconButton,
  IconButtonProps,
  IconButtonTypeMap,
  Tooltip
} from "@mui/material";
import { forwardRef } from "react";

export const IconButtonWithTooltip = forwardRef(<D extends React.ElementType = IconButtonTypeMap["defaultComponent"],
  P extends {} = {}>({
                       label,
                       children,
                       ...props
                     }: IconButtonProps<D, P & { label: string }>, ref: any) => {
  return (
    <Tooltip title={label}>
      <IconButton ref={ref} size="normal" aria-label={label} {...props}>
        {children}
      </IconButton>
    </Tooltip>
  );
});

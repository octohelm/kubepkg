import {
  IconButton,
  IconButtonProps,
  IconButtonTypeMap,
  Tooltip,
} from "@mui/material";

export const IconButtonWithTooltip = <
  D extends React.ElementType = IconButtonTypeMap["defaultComponent"],
  P extends {} = {}
>({
  label,
  children,
  ...props
}: IconButtonProps<D, P & { label: string }>) => {
  return (
    <Tooltip title={label}>
      <IconButton size="normal" aria-label={label} {...props}>
        {children}
      </IconButton>
    </Tooltip>
  );
};

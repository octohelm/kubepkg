import { startsWith } from "@innoai-tech/lodash";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Link as RouterLink, useLocation, useMatch } from "@nodepkg/router";

export interface ListItemLinkProps {
  icon?: JSX.Element;
  title: JSX.Element | string;
  to: string;
  strict?: boolean;
}

export const ListItemLink = ({ icon, title, to, strict }: ListItemLinkProps) => {
  const location = useLocation();

  const matched = useMatch(to) || (!strict && startsWith(location.pathname, to));

  if (icon) {
    return (
      <ListItem
        button={true}
        component={RouterLink}
        to={to}
        selected={!!matched}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={title} />
      </ListItem>
    );
  }

  return (
    <ListItem component={RouterLink} to={to} selected={!!matched}>
      <ListItemIcon />
      <ListItemText secondary={title} />
    </ListItem>
  );
};

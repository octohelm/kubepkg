import { startsWith } from "@innoai-tech/lodash";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Link as RouterLink, useLocation, useMatch } from "@nodepkg/router";

export interface ListItemLinkProps {
  icon?: JSX.Element;
  title: JSX.Element | string;
  to: string;
}

export const ListItemLink = (props: ListItemLinkProps) => {
  const { icon, title, to } = props;

  const location = useLocation();

  const matched = useMatch(to) || startsWith(location.pathname, to);

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
    <ListItem component={RouterLink} to={to} selected={!!matched} >
      <ListItemIcon />
      <ListItemText secondary={title} />
    </ListItem>
  );
};

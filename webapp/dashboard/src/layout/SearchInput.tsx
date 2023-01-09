import { alpha, InputBase, styled } from "@mui/material";

export const Search = styled("label")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  marginLeft: 0,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const SearchIcon = styled("div")(({ theme }) => ({
  padding: theme.spacing(1, 1),
  height: "100%",
  width: "3em",
  display: "flex",
  color: "inherit",
  alignItems: "center",
  justifyContent: "center",
}));

export const SearchInput = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    transition: theme.transitions.create("width"),
    width: "100%",
  },
  color: "inherit",
}));

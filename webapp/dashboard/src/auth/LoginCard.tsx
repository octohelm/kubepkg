import { useRequest, useObservable } from "@innoai-tech/reactutil";
import {
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { map } from "@innoai-tech/lodash";
import { parseSearch } from "@innoai-tech/fetcher";

import { listAuthProvider, authorize } from "../client/dashboard";

const useAuthState = () => {
  const location = useLocation();
  const redirectURI = parseSearch(location.search)["redirect_uri"];
  return btoa((redirectURI || [])[0] || "");
};

export const LoginCard = () => {
  const listAuthProvider$ = useRequest(listAuthProvider);
  const authorize$ = useRequest(authorize);
  const authState = useAuthState();

  useEffect(() => {
    listAuthProvider$.next();
  }, []);

  const resp = useObservable(listAuthProvider$);

  if (!resp) {
    return null;
  }

  return (
    <Card sx={{ minWidth: 300 }}>
      <CardContent>
        <Typography
          sx={{ fontSize: 14 }}
          color="text.secondary"
          gutterBottom={true}
        >
          KubePkg
        </Typography>
        <Typography variant="h5" component="div">
          Dashboard
        </Typography>
        <br />
        <br />
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        {map(resp.body, (p) =>
          p.type === "oauth" ? (
            <Button
              key={p.name}
              size="small"
              href={authorize$.toHref({ name: p.name, state: authState })}
            >
              通过 {p.name} 登录
            </Button>
          ) : null
        )}
      </CardActions>
    </Card>
  );
};
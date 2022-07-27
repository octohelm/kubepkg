import { useLocation, useParams, useNavigate } from "react-router";
import { parseSearch } from "@innoai-tech/fetcher";
import { useObservableEffect } from "@innoai-tech/reactutil";
import { useEffect } from "react";
import { merge } from "rxjs";
import { tap } from "rxjs/operators";
import { TokenProvider } from "./domain";

export const AuthorizeCallback = ({ name }: { name?: string }) => {
  const token$ = TokenProvider.use$();

  const params = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const query = parseSearch(location.search);

  const apName = name || params["name"] || "";
  const code = (query["code"] || [])[0] || "";
  const state = (query["state"] || [])[0] || btoa("/");
  const redirectURI = atob(state);

  useObservableEffect(() => {
    return merge(
      token$.exchange$.error$.pipe(
        tap((error) => {
          console.log(error);
        })
      ),
      token$.exchange$.pipe(
        tap(() => {
          nav(redirectURI);
        })
      )
    );
  }, []);

  useEffect(() => {
    token$.exchange$.next({
      name: apName,
      body: {
        code: code,
      },
    });
  }, []);

  return null;
};

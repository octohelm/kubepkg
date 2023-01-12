import { useLocation, useParams, useNavigate } from "react-router";
import { parseSearch } from "@innoai-tech/fetcher";
import { useObservableEffect, useAsObservable, useStateSubject, Subscribe } from "@innoai-tech/reactutil";
import { combineLatest, filter, merge } from "rxjs";
import { tap } from "rxjs";
import { TokenProvider } from "./domain";

export const AuthorizeCallback = ({ name }: { name?: string }) => {
  const params = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const query = parseSearch(location.search);

  const redirectURI = atob((query["state"] || [])[0] || btoa("/"));

  const token$ = TokenProvider.use$();

  const apName$ = useAsObservable(name || params["name"] || "");
  const code$ = useAsObservable((query["code"] || [])[0] || "");
  const error$ = useStateSubject("");

  useObservableEffect(() =>
    merge(
      combineLatest(
        apName$.pipe(filter((v) => !!v)),
        code$.pipe(filter((v) => !!v))
      ).pipe(
        tap(([apName, code]) => {
          token$.exchange$.next({
            name: apName,
            body: { code }
          });
        })
      ),
      token$.exchange$.pipe(
        tap(() => nav(redirectURI))
      ),
      token$.exchange$.error$.pipe(
        tap((errResp) => {
          error$.next(JSON.stringify(errResp.body, null));
        })
      )
    ));

  return (
    <Subscribe value$={error$}>
      {(err) => !!err ? <span>{err}</span> : null}
    </Subscribe>
  );
};

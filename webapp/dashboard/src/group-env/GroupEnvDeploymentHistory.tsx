import type { ApisKubepkgV1Alpha1KubePkg } from "../client/dashboard";
import {
  deploymentID,
  deploymentRevision,
  GroupEnvDeploymentsProvider,
} from "../group";
import { map as rxMap, Observable, tap } from "rxjs";
import { format, parseISO } from "date-fns";
import {
  useObservableEffect,
  useAsObservable,
  useRequest,
  useObservableState,
  StateSubject,
  Subscribe,
} from "@nodepkg/state";
import { listGroupEnvDeploymentHistory } from "../client/dashboard";
import { List, ListItem, ListItemText } from "@mui/material";
import { useGroupEnvDeploymentFormWithDialog } from "./GroupEnvDeployementForm";

const GroupEnvDeploymentHistory = ({
  kubepkg$,
  deploymentID$,
}: {
  kubepkg$: StateSubject<ApisKubepkgV1Alpha1KubePkg>;
  deploymentID$: Observable<string>;
}) => {
  const groupEnvDeployments$ = GroupEnvDeploymentsProvider.use$();
  const listHistory$ = useRequest(listGroupEnvDeploymentHistory);

  useObservableEffect(() =>
    deploymentID$.pipe(
      rxMap((deploymentID) => ({
        groupName: groupEnvDeployments$.groupName,
        envName: groupEnvDeployments$.envName,
        deploymentID: deploymentID,
      })),
      tap(listHistory$.next)
    )
  );

  const resp = useObservableState(listHistory$);

  return (
    <List dense>
      {resp?.body?.map((k) => {
        return (
          <Subscribe value$={kubepkg$} key={deploymentRevision(k)}>
            {(current) => (
              <ListItem
                selected={deploymentRevision(current) === deploymentRevision(k)}
                onClick={() => {
                  kubepkg$.next(k);
                }}
              >
                <ListItemText
                  primary={k.spec.version}
                  secondary={
                    <small>
                      {k.metadata?.creationTimestamp &&
                        format(
                          parseISO(k.metadata?.creationTimestamp),
                          "yyyy-MM-dd HH:mm"
                        )}
                    </small>
                  }
                />
              </ListItem>
            )}
          </Subscribe>
        );
      })}
    </List>
  );
};

export const useGroupEnvDeploymentHistoryFormWithDialog = (
  kubepkg: ApisKubepkgV1Alpha1KubePkg
) => {
  const deploymentID$ = useAsObservable(deploymentID(kubepkg));

  return useGroupEnvDeploymentFormWithDialog(kubepkg, {
    title: () => "历史部署",
    content: (kubepkg$) => (
      <GroupEnvDeploymentHistory
        kubepkg$={kubepkg$}
        deploymentID$={deploymentID$}
      />
    ),
  });
};

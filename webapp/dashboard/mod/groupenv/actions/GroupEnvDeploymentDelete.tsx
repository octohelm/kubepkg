import { deleteGroupEnvDeployment } from "@webapp/dashboard/client/dashboard";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import {
  component$,
  useRequest,
  t,
  ext,
  rx,
  subscribeUntilUnmount,
  EventKit
} from "@nodepkg/runtime";
import {
  useDialogPrompt,
  Tooltip,
  IconButton,
  Icon,
  mdiTrashCanOutline
} from "@nodepkg/ui";

export const useGroupEnvDeploymentDel = (opts: {
  groupName: string;
  envName: string;
  deploymentName: string;
}) => {
  const del$ = useRequest(deleteGroupEnvDeployment);

  const dialog$ = useDialogPrompt({
    $title: () => "确认删除部署",
    $content: () => `${opts.deploymentName}`,
    onConfirm: () => {
      del$.next({
        groupName: opts.groupName,
        envName: opts.envName,
        deploymentName: opts.deploymentName
      });
    }
  });

  return ext(del$, {
    action: "删除部署",
    dialog$: dialog$
  });
};

export const GroupEnvDeploymentDeleteBtn = component$(
  {
    groupName: t.string(),
    envName: t.string(),
    deploymentName: t.string(),
    onDidDelete: t.custom<(deploymentName: string) => void>()
  },
  (props, { emit }) => {
    const del$ = useGroupEnvDeploymentDel(props);

    rx(
      del$,
      subscribeUntilUnmount(() => emit("did-delete", props.deploymentName))
    );

    const iconButtonClick$ = EventKit.create<MouseEvent>();

    rx(
      iconButtonClick$,
      EventKit.stopPropagation(),
      subscribeUntilUnmount(() => {
        del$.dialog$.value = true;
      })
    );

    return () => {
      return (
        <AccessControl op={del$}>
          <Tooltip title={del$.action}>
            <IconButton onClick={iconButtonClick$}>
              <Icon path={mdiTrashCanOutline} />
            </IconButton>
          </Tooltip>
          {del$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);
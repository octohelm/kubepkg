import {
  t,
  rx,
  component$,
  subscribeUntilUnmount,
  EventKit,
  useRequest
} from "@nodepkg/runtime";
import {
  listGroupEnvDeployment
} from "@webapp/dashboard/client/dashboard";
import {
  Tooltip,
  IconButton,
  Icon,
  mdiApplicationExport
} from "@nodepkg/ui";
import { AccessControl } from "@webapp/dashboard/mod/auth";

export const GroupEnvDeploymentsExportBtn = component$(
  {
    groupName: t.string(),
    envName: t.string()
  },
  (props) => {
    const list$ = useRequest(listGroupEnvDeployment);

    const iconButtonClick$ = EventKit.create<MouseEvent>();

    rx(
      iconButtonClick$,
      EventKit.stopPropagation(),
      subscribeUntilUnmount(() => {
        window.open(list$.toHref({
          groupName: props.groupName,
          envName: props.envName,
          size: -1,
        }));
      })
    );

    return () => {
      return (
        <AccessControl op={list$}>
          <Tooltip title={"导出部署"}>
            <IconButton onClick={iconButtonClick$}>
              <Icon path={mdiApplicationExport} />
            </IconButton>
          </Tooltip>
        </AccessControl>
      );
    };
  }
);

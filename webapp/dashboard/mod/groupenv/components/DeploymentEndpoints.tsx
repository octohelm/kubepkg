import type { ApisKubepkgV1Alpha1KubePkg } from "@webapp/dashboard/client/dashboard";
import { component, t, RouterLink } from "@innoai-tech/vuekit";
import { Tooltip, styled, mdiApi, Icon, mdiOpenInNew } from "@nodepkg/ui";
import {
  pathToOpenAPISpecDoc,
  openAPISpecPath
} from "@webapp/dashboard/mod/groupenv/helpers";
import { map } from "@nodepkg/runtime/lodash";

export const DeploymentEndpoints = component(
  {
    kubepkg: t.custom<ApisKubepkgV1Alpha1KubePkg>()
  },
  (props) => {
    return () => {
      if (props.kubepkg.status?.endpoint) {
        const openAPISpec = openAPISpecPath(props.kubepkg);

        return (
          <>
            {map(props.kubepkg.status?.endpoint, (address, name) => {
              if (name !== "default") {
                return (
                  <>
                    {openAPISpec && (
                      <Chip>
                        <Tooltip title={"OpenAPI 文档"}>
                        <span>
                          <RouterLink
                            {...({ target: "_blank" } as any)}
                            to={pathToOpenAPISpecDoc(
                              `${address}${openAPISpec}`
                            )}
                          >
                            <Icon path={mdiApi} placement={"start"} />
                          </RouterLink>
                        </span>
                        </Tooltip>
                      </Chip>
                    )}
                    <Chip>
                      <Tooltip title={`访问地址`}>
                        <a href={address} target={"_blank"}>
                          {name}
                          <Icon path={mdiOpenInNew} placement={"end"} />
                        </a>
                      </Tooltip>
                    </Chip>
                  </>
                );
              }
              return null;
            })}
          </>
        );
      }
      return null;
    };
  }
);

const Chip = styled(
  "div"
)({
  px: 8,
  h: 16,
  rounded: 16,
  textStyle: "sys.body-small",
  containerStyle: "sys.primary-container",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,

  "& > *, & a": {
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    gap: 4
  }
});

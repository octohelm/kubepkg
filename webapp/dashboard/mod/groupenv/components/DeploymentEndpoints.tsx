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
                  <Endpoint
                    key={name}
                    name={name}
                    endpoint={address}
                    openAPISpec={openAPISpec}
                  />
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

const Endpoint = styled(
  "div",
  {
    name: t.string(),
    endpoint: t.string(),
    openAPISpec: t.string().optional()
  },
  (props) => (Wrap) => {
    return (
      <Wrap>
        {props.openAPISpec && (
          <Tooltip title={"OpenAPI 文档"}>
            <span>
              <RouterLink
                {...({ target: "_blank" } as any)}
                to={pathToOpenAPISpecDoc(
                  `${props.endpoint}${props.openAPISpec}`
                )}
              >
                <Icon path={mdiApi} placement={"start"} />
              </RouterLink>
            </span>
          </Tooltip>
        )}
        <Tooltip title={`访问地址 ${props.endpoint}`}>
          <a href={props.endpoint} target={"_blank"}>
            {props.name}
            <Icon path={mdiOpenInNew} placement={"end"} />
          </a>
        </Tooltip>
      </Wrap>
    );
  }
)({
  px: 10,
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
  },

  $data_icon: {
    fontSize: "1em",
    _data_placement__start: {
      ml: -4
    },
    _data_placement__end: {
      mr: -4
    }
  },

  $data_endpoint_address: {
    display: "none"
  },

  _hover: {
    $data_endpoint_address: {
      display: "inline-block",
      ml: 4
    }
  }
});

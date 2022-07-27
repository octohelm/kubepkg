import { index, path, Scaffold } from "../layout";
import {
  WorkspacesOutlined,
  CloudOutlined,
  PeopleOutlined,
} from "@mui/icons-material";
import { ClusterMain } from "../cluster";
import {
  GroupMain,
  GlobalGroupProvider,
  GroupTitle,
  GroupAccountMain,
} from "../group";
import { GroupEnvMain, GroupEnvMenu } from "../group-env";
import { Outlet } from "react-router-dom";
import { AccountMain, AdminAccountMain } from "../account";
import { GroupRobotMain } from "../group";

export const groupRoutes = path("groups/:group")
  .root(true)
  .title(<GroupTitle />)
  .element(
    <GlobalGroupProvider>
      <Outlet />
    </GlobalGroupProvider>
  )
  .children(
    index().element(<Scaffold>TODO</Scaffold>),
    path("envs")
      .title("环境")
      .icon(<WorkspacesOutlined />)
      .children(
        index().element(<GroupEnvMain />),
        path(":env")
          .title("环境")
          .menu(<GroupEnvMenu />)
          .element(<Scaffold>env</Scaffold>)
      ),
    path("members")
      .title("成员")
      .icon(<PeopleOutlined />)
      .children(
        index().element(<GroupAccountMain />),
        path("robots")
          .title("机器人")
          .element(<GroupRobotMain />)
      )
  );

export const adminRoutes = path("admin")
  .root(true)
  .children(
    index().element(<Scaffold />),
    path("clusters")
      .title("集群")
      .icon(<CloudOutlined />)
      .element(<ClusterMain />),
    path("groups")
      .title("组织")
      .icon(<WorkspacesOutlined />)
      .element(<GroupMain />),
    path("accounts")
      .title("用户")
      .icon(<PeopleOutlined />)
      .children(
        index().element(<AccountMain />),
        path("admins")
          .title("系统管理员")
          .element(<AdminAccountMain />)
      )
  )();

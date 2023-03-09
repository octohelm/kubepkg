import { Outlet } from "@nodepkg/router";
import { MustLogon } from "../../auth";

export default () => (
  <MustLogon>
    <Outlet />
  </MustLogon>
)
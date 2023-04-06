import { RouterView, component } from "@nodepkg/runtime";
import { MustLogon } from "@webapp/dashboard/mod/auth";

export default component(() => () => (
  <MustLogon>
    <RouterView />
  </MustLogon>
));
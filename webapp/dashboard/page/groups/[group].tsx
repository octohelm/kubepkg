import { MustLogon } from "@webapp/dashboard/mod/auth";
import { RouterView, t, component } from "@nodepkg/runtime";
import { GroupContext, GroupTitle } from "@webapp/dashboard/mod/group";
import { Scaffold } from "@webapp/dashboard/layout";
import { GroupEnvContext } from "@webapp/dashboard/mod/groupenv";

export default component(
  {
    group: t.string()
  },
  (props) => {
    return () => (
      <MustLogon>
        <GroupContext groupName={props.group}>
          <GroupEnvContext groupName={props.group}>
            <Scaffold $toolbar={<GroupTitle />}>
              <RouterView />
            </Scaffold>
          </GroupEnvContext>
        </GroupContext>
      </MustLogon>
    );
  },
  {
    inheritAttrs: false
  }
);

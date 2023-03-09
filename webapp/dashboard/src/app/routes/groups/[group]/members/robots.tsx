import { Scaffold } from "src/app/layout";

import { GroupRobotList, GroupRobotMainToolbar, GroupRobotProvider } from "src/group";


export const title = "机器人";
export default () => {
  return (
    <GroupRobotProvider>
      <Scaffold toolbar={<GroupRobotMainToolbar />}>
        <GroupRobotList />
      </Scaffold>
    </GroupRobotProvider>
  );
};
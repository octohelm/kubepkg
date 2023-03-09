import { AdminAccountList, AdminAccountProvider, AdminAdd } from "src/account";
import { Scaffold } from "src/app/layout";


export const title = "系统管理员";

export default (() => {
  return (
    <AdminAccountProvider>
      <Scaffold action={<AdminAdd />}>
        <AdminAccountList />
      </Scaffold>
    </AdminAccountProvider>
  );
});

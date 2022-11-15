import { createSubject } from "./state";
import { map } from "@innoai-tech/lodash";
import { Subscribe } from "@innoai-tech/reactutil";
import { Snackbar } from "@mui/material";

export const NotificationProvider = createSubject(({}, use) => {
  let id = 0;

  const n$ = use([] as Array<{ msg: string; id: number }>, {
    notify: (msg: string) => {
      n$.next((list) => [...list, { msg, id: id++ }]);
    },
    remove: (id: number) => {
      n$.next((list) => list.filter((n) => n.id !== id));
    },
  });
  return n$;
});

export const NotificationSnackbar = () => {
  const notifications$ = NotificationProvider.use$();

  return (
    <Subscribe value$={notifications$}>
      {(notifications) => (
        <>
          {map(notifications, (n) => (
            <Snackbar
              open={true}
              key={n.id}
              autoHideDuration={2500}
              onClose={() => notifications$.remove(n.id)}
              message={n.msg}
            />
          ))}
        </>
      )}
    </Subscribe>
  );
};

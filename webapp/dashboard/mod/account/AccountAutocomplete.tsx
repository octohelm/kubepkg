import type {
  AccountId,
  AccountUser,
} from "@webapp/dashboard/client/dashboard";
import {
  component$,
  observableRef,
  useRequest,
  rx,
  subscribeUntilUnmount,
  t,
} from "@nodepkg/runtime";
import { listAccount } from "@webapp/dashboard/client/dashboard";
import { debounceTime, filter, tap } from "@nodepkg/runtime/rxjs";
import {
  styled,
  IconButton,
  Icon,
  Tooltip,
  mdiPlusThick,
  Dialog,
  mdiLoading,
  Box,
  ListItem,
} from "@nodepkg/ui";
import { alpha, variant } from "@innoai-tech/vueuikit";
import { cloneVNode } from "@nodepkg/runtime/vue";

export const AccountAutocompleteBtn = component$(
  {
    title: t.string().optional(),
    onSelected: t.custom<(accountID: AccountId, done: () => void) => void>(),
  },
  (props, { emit }) => {
    const dialogOpen$ = observableRef(false);

    const done = () => {
      dialogOpen$.value = false;
    };

    return () => (
      <>
        <Tooltip title={props.title}>
          <IconButton onClick={() => (dialogOpen$.value = true)}>
            <Icon path={mdiPlusThick} />
          </IconButton>
        </Tooltip>
        <Dialog
          isOpen={dialogOpen$.value}
          onClose={() => (dialogOpen$.value = false)}
        >
          <AccountAutocompleteDialog
            title={`输入用户邮箱查询${props.title ? `, 并${props.title}` : ""}`}
            onSelected={(accountID) => emit("selected", accountID, done)}
          />
        </Dialog>
      </>
    );
  }
);

export const AccountAutocompleteDialog = component$(
  {
    title: t.string().optional(),
    onSelected: t.custom<(accountID: AccountId) => void>(),
  },
  (props, { emit, render }) => {
    const inputValue$ = observableRef("");
    const popoverOpen$ = observableRef(false);
    const options$ = observableRef([] as AccountUser[]);

    const listAccount$ = useRequest(listAccount);

    rx(
      inputValue$,
      filter((inputValue) => inputValue.length >= 3),
      debounceTime(300),
      tap(() => (options$.value = [])),
      subscribeUntilUnmount((inputValue) =>
        listAccount$.next({ identity: [inputValue] })
      )
    );

    rx(
      listAccount$,
      tap(() => (popoverOpen$.value = true)),
      tap((resp) => (options$.value = resp.body.data || [])),
      subscribeUntilUnmount()
    );

    const loadingEl = rx(
      listAccount$.requesting$,
      render((requesting) => {
        return requesting ? <Icon path={mdiLoading} /> : null;
      })
    );

    const listEl = rx(
      options$,
      render((options) => (
        <ListContainer>
          {options.map((user) => (
            <ListItem
              $heading={
                <Box sx={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{user.nickname}</span>
                </Box>
              }
              $supporting={<span>{user.email}</span>}
              $trailing={<Icon path={mdiPlusThick} />}
              onClick={() => {
                emit("selected", user.accountID);
              }}
              sx={{ cursor: "pointer" }}
            />
          ))}
        </ListContainer>
      ))
    );

    return () => {
      return (
        <DialogContainer>
          <InputControl data-focus={popoverOpen$.value}>
            {cloneVNode(
              <input
                type="text"
                placeholder={props.title ?? ""}
                onInput={(e) =>
                  (inputValue$.value = (e.target as HTMLInputElement).value)
                }
              />,
              {
                onVnodeMounted(n) {
                  (n.el as HTMLInputElement)?.focus();
                },
              }
            )}
            {loadingEl}
          </InputControl>
          {listEl}
        </DialogContainer>
      );
    };
  }
);

const DialogContainer = styled("div")({
  pos: "absolute",
  top: "20vh",
  width: "60vw",
  containerStyle: "sys.surface-container",
  elevation: "0",
  rounded: "sm",
  overflow: "hidden",
  "&:focus-within": {
    shadow: "2",
  },
});

const ListContainer = styled("div")({
  containerStyle: "sys.surface-container",
  borderTop: "1px solid",
  borderColor: variant("sys.outline-variant", alpha(0.38)),
});

const InputControl = styled("div")({
  height: 48,
  px: 16,
  display: "flex",
  alignItems: "center",
  width: "100%",
  "& input": {
    flex: 1,
    width: "100%",
    color: "inherit",
    border: "none",
    outline: "none",
    bgColor: "rgba(0,0,0,0)",
  },
});

import {
  t,
  component,
  useRequest,
  component$,
  rx,
  onMounted,
  Fragment
} from "@nodepkg/runtime";
import { ListItem } from "@nodepkg/ui";
import {
  listAccount,
  type AccountUser
} from "@webapp/dashboard/client/dashboard";
import { Container } from "@webapp/dashboard/layout";

export const AccountListItem = component(
  {
    user: t.custom<AccountUser>()
  },
  (props) => {
    return () => {
      const { user } = props;

      return (
        <ListItem
          $heading={<span>{user.nickname}</span>}
          $supporting={<span>{user.email}</span>}
        />
      );
    };
  }
);

export const AccountList = component$(({}, { render }) => {
  const listAccount$ = useRequest(listAccount);

  onMounted(() => {
    listAccount$.next({
      size: -1
    });
  });

  const listEl = rx(
    listAccount$,
    render((resp) => {
      return resp?.body?.data.map((account) => {
        return (
          <Fragment key={account.accountID}>
            <AccountListItem user={account} />
          </Fragment>
        );
      });
    })
  );

  return () => (
    <Container>
      {listEl}
    </Container>
  );
});

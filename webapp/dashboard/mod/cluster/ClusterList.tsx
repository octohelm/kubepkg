import {
  t,
  useRequest,
  component$,
  rx,
  onMounted,
  observableRef,
  Fragment,
  render
} from "@nodepkg/runtime";
import { ListItem, styled } from "@nodepkg/ui";
import {
  listCluster,
  type Cluster,
  getClusterStatus,
  ClusterNetType
} from "@webapp/dashboard/client/dashboard";
import { Container } from "@webapp/dashboard/layout";
import { interval, map, merge } from "@nodepkg/runtime/rxjs";
import { subscribeUntilUnmount } from "@innoai-tech/vuekit";
import { ClusterAddBtn, ClusterCreateAgentResourcesBtn, ClusterEditBtn, ClusterRenameBtn } from "./actions";
import { Chip } from "./ui";

export const ClusterStatus = component$(
  {
    cluster: t.custom<Cluster>()
  },
  ({ cluster }, { render }) => {
    const state$ = useRequest(getClusterStatus);

    rx(
      interval(10 * 1000),
      subscribeUntilUnmount(() => {
        state$.next({
          name: cluster.clusterID
        });
      })
    );

    onMounted(() => {
      state$.next({
        name: cluster.clusterID
      });
    });

    return rx(
      merge(
        state$.pipe(map((resp) => resp.body)),
        state$.error$.pipe(map((_) => ({ id: "-", ping: "-" })))
      ),
      render((status) => {
        return (
          <StyledStatus data-error={status.ping == "-"}>
            {status.id} {status.ping}
          </StyledStatus>
        );
      })
    );
  }
);

const StyledStatus = styled("small")({
  opacity: 0.7,
  color: "sys.success",

  "&[data-error=true]": {
    color: "sys.error"
  }
});

export const ClusterListItem = component$(
  {
    cluster: t.custom<Cluster>()
  },
  (props) => {
    const cluster$ = observableRef(props.cluster);

    rx(
      props.cluster$,
      subscribeUntilUnmount((c) => (cluster$.value = c))
    );

    return rx(
      cluster$,
      render((cluster) => {
        const canDirect =
          cluster.netType == ClusterNetType.DIRECT && !!(cluster.agentInfo?.endpoint);

        return (
          <ListItem
            $heading={
              <Row>
                <span>{cluster.name}</span>
                <Chip>{cluster.netType}</Chip>
                {canDirect && <ClusterStatus cluster={cluster} />}
              </Row>
            }
            $supporting={
              <Row>
                {cluster.desc && <span>{cluster.desc}</span>}
                {cluster.agentInfo?.endpoint && (
                  <a target={"_blank"} href={cluster.agentInfo?.endpoint}>
                    {cluster.agentInfo?.endpoint}
                  </a>
                )}
              </Row>
            }
            $trailing={
              <>
                <ClusterCreateAgentResourcesBtn
                  cluster={cluster}
                />
                <ClusterRenameBtn
                  cluster={cluster}
                  onDidUpdate={(c) => cluster$.value = c}
                />
                <ClusterEditBtn
                  cluster={cluster}
                  onDidUpdate={(c) => cluster$.value = c}
                />
              </>
            }
          />
        );
      })
    );
  }
);

const Row = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: 8
});

export const ClusterList = component$(({}, { render }) => {
  const list$ = useRequest(listCluster);

  const load = () => {
    list$.next();
  };

  onMounted(load);

  const listEl = rx(
    list$,
    render((resp) => {
      return resp?.body?.map((cluster) => {
        return (
          <Fragment key={cluster.clusterID}>
            <ClusterListItem cluster={cluster} />
          </Fragment>
        );
      });
    })
  );

  return () => (
    <Container $action={<ClusterAddBtn onDidAdd={() => load()} />}>
      {listEl}
    </Container>
  );
});

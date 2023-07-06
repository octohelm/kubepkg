import {
  observableRef,
  useRouter,
  useRoute,
  rx,
  subscribeUntilUnmount,
} from "@innoai-tech/vuekit";
import { isArray, mapValues } from "@innoai-tech/lodash";

const parseQuery = <T extends any>(
  v: string | string[],
  defaultValue: T,
): T => {
  if (isArray(v)) {
    if (isArray(defaultValue)) {
      return v.map((v) => parseQuery(v, defaultValue)) as T;
    }
    return parseQuery(v[0]!, defaultValue);
  }
  v = decodeURIComponent(v);

  switch (typeof defaultValue) {
    case "number":
      return parseFloat(v) as T;
    case "boolean":
      return Boolean(v) as T;
    default:
      return v as T;
  }
};

export const observableRefWithSyncURL = <T extends Record<string, any>>(
  defaults: T,
  enabled = false,
) => {
  const router = useRouter();
  const route = useRoute();

  const values$ = observableRef<T>(
    mapValues(defaults, (v, k) => {
      return parseQuery((route.query[k] as any) ?? `${v}`, v);
    }) as any,
  );

  if (enabled) {
    rx(
      values$,
      subscribeUntilUnmount((values) => {
        router.replace({
          query: {
            ...route.query,
            ...mapValues(values, (v) => {
              if (isArray(v)) {
                return v.map((v: any) => encodeURIComponent(v));
              }
              return encodeURIComponent(v);
            }),
          },
        });
      }),
    );
  }

  return values$;
};

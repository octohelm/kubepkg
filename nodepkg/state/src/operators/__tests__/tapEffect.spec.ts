/**
 *  @vitest-environment jsdom
 **/
import { test, describe, expect } from "vitest";
import { tapEffect } from "..";
import {
  useAsObservable,
  useObservableEffect,
  StateSubject,
} from "@innoai-tech/reactutil";
import { renderHook } from "@testing-library/react";

describe("#tapEffect", () => {
  const count$ = new StateSubject<[number, number]>([0, 0]);

  const hook = renderHook(
    ({ input }) => {
      const input$ = useAsObservable(input);

      useObservableEffect(
        input$.pipe(
          tapEffect(() => {
            count$.next(([l, u]) => [l + 1, u]);
            return () => {
              count$.next(([l, u]) => [l, u + 1]);
            };
          })
        )
      );

      return null;
    },
    {
      initialProps: { input: 1 },
    }
  );

  test("when first render, should got 1 subs and 0 cleans", () => {
    expect(count$.value).toEqual([1, 0]);
  });

  test("when re render without changes, should got 2 subs and 1 cleans", () => {
    hook.rerender({ input: 1 });
    expect(count$.value).toEqual([1, 0]);
  });

  test("when input with changes, should got 2 subs and 1 cleans", () => {
    hook.rerender({ input: 2 });
    expect(count$.value).toEqual([2, 1]);
  });

  test("when unmount, should got 2 subs and 2 cleans", () => {
    hook.unmount();

    expect(count$.value).toEqual([2, 2]);
  });
});

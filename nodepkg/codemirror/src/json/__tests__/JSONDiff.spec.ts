import { expect, describe, it } from "vitest";
import { diff } from "../JSONDiff";

describe("JSONDiff", () => {
  it("should diff modifies", () => {
    const ret = diff({ x: 2 }, { x: 1 });

    expect([...ret.entries()]).toEqual([["/x", ["m", 2, 1]]]);
  });

  it("should diff deep modifies", () => {
    const ret = diff(
      {
        x: {
          a: {
            "aliyun.com/gpu-mem": 2
          }
        }
      },
      {
        x: {
          a: {
            "aliyun.com/gpu-mem": 1
          }
        }
      }
    );

    expect([...ret.entries()]).toEqual([[`/x/a/aliyun.com~1gpu-mem`, ["m", 2, 1]]]);
  });

  it("should diff deletes", () => {
    const ret = diff({}, { x: 2 });

    expect([...ret.entries()]).toEqual([["/x", ["d", undefined, 2]]]);
  });

  it("should diff adds", () => {
    const ret = diff({ x: 1, a: 2 }, { x: 1 });

    expect([...ret.entries()]).toEqual([["/a", ["a", 2, undefined]]]);
  });
});

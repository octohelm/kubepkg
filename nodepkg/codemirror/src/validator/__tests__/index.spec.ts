import { describe, expect, it } from "vitest";
import { createValidator } from "../index";

describe("#createValidator", () => {
  const validate = createValidator({
    type: "object",
    properties: {
      obj: {
        type: "object",
        properties: {
          a: { type: "string" },
          c: { type: "string", enum: ["X", "Y", "Z"] },
        },
        required: ["a"],
      },
      arr: {
        type: "array",
        items: { type: "string" },
        maxItems: 3,
      },
      union: {
        anyOf: [
          {
            type: "object",
            properties: {
              a: { type: "string" },
            },
            required: ["a"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              b: { type: "string" },
            },
            required: ["b"],
            additionalProperties: false,
          },
        ],
      },
    },
    additionalProperties: false,
  })!;

  it("validate additional properties", () => {
    expect(
      validate({
        x: 1,
      })
    ).toEqual({
      "/x": "must NOT have additional properties",
    });
  });

  it("validate required", () => {
    expect(
      validate({
        obj: {},
      })
    ).toEqual({
      "/obj/": "must have required property 'a'",
    });
  });

  it("validate type", () => {
    expect(
      validate({
        obj: {
          a: 1,
        },
      })
    ).toEqual({
      "/obj/a": "must be string",
    });
  });

  it("validate type", () => {
    expect(
      validate({
        obj: {
          a: 1,
        },
      })
    ).toEqual({
      "/obj/a": "must be string",
    });
  });

  it("validate enum", () => {
    expect(
      validate({
        obj: {
          a: "1",
          c: "1",
        },
      })
    ).toEqual({
      "/obj/c": "must be equal to one of the allowed values: X, Y, Z",
    });
  });

  it("validate type in array", () => {
    expect(
      validate({
        arr: ["1", 2],
      })
    ).toEqual({
      "/arr/1": "must be string",
    });
  });

  it("validate items", () => {
    expect(
      validate({
        arr: ["1", "2", "3", "4"],
      })
    ).toEqual({
      "/arr/": "must NOT have more than 3 items",
    });
  });

  it("validate union with partial matched", () => {
    expect(
      validate({
        union: {
          a: "1",
          undefined: "a",
        },
      })
    ).toEqual({
      "/union/undefined": "must NOT have additional properties",
    });
  });

  it("validate union without match", () => {
    expect(
      validate({
        union: {},
      })
    ).toEqual({
      "/union/": "must have required property 'a'",
    });
  });
});

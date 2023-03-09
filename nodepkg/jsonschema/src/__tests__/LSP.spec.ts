import { describe, expect, it } from "vitest";
import { LSP } from "../LSP";

describe("LSP", () => {
  const lsp = LSP.create({
    definitions: {
      A: { type: "string" },
      B: { type: "integer" },
      C: { type: "string", enum: ["X", "Y", "Z"] },
      ObjC: {
        type: "object",
        properties: {
          c: { $ref: "#/definitions/C" }
        }
      },
      Obj: {
        allOf: [
          { $ref: "#/definitions/ObjC" },
          {
            type: "object",
            properties: {
              a: { $ref: "#/definitions/A" },
              nested: { $ref: "#/definitions/ObjC" }
            },
            required: ["a"]
          }
        ]
      },
      Arr: {
        type: "array",
        items: { type: "string" }
      },
      Map: {
        type: "object",
        additionalProperties: {
          type: "string"
        }
      },
      Union: {
        type: "object",
        discriminator: {
          propertyName: "type"
        },
        required: ["type"],
        oneOf: [
          {
            properties: {
              type: { enum: ["A"] },
              a: { $ref: "#/definitions/A" },
              b: { $ref: "#/definitions/B" }
            },
            required: ["a"],
            additionalProperties: false
          },
          {
            properties: {
              type: { enum: ["B"], type: "string" },
              b: { $ref: "#/definitions/B" }
            },
            required: ["b"],
            additionalProperties: false
          }
        ]
      }
    },
    type: "object",
    additionalProperties: false,
    properties: {
      obj: { $ref: "#/definitions/Obj" },
      arr: { $ref: "#/definitions/Arr" },
      map: { $ref: "#/definitions/Map" },
      union: { $ref: "#/definitions/Union" }
    }
  })!;

  describe("#schemaAt", () => {
    it("should return empty when not found", () => {
      expect(lsp.schemaAt(["x"])).toBeNull();
    });

    it("should return when matched", () => {
      expect(lsp.schemaAt(["obj", "nested", "c"])?.parents).toHaveLength(4);
    });

    it("should return when matched in map", () => {
      expect(lsp.schemaAt(["map", "x"])?.parents).toHaveLength(3);
    });

    it("should return when matched in array", () => {
      expect(lsp.schemaAt(["arr", 1])?.parents).toHaveLength(3);
    });

    it("should return when matched in tagged union", () => {
      expect(lsp.schemaAt(["union", ["b", { type: "A" }]])?.parents).toHaveLength(3);
    });

    it("should return null when not matched in tagged union", () => {
      expect(lsp.schemaAt(["union", ["b", { type: "C" }]])).toBeNull();
    });
  });

  describe("#validate", () => {
    it("should validate additional properties", () => {
      expect(
        lsp.validate({
          x: 1
        })
      ).toEqual({
        "/x": "must NOT have additional properties"
      });
    });

    it("should validate required", () => {
      expect(
        lsp.validate({
          obj: {}
        })
      ).toEqual({
        "/obj": "must have required property 'a'"
      });
    });

    it("should validate type", () => {
      expect(
        lsp.validate({
          obj: {
            a: 1
          }
        })
      ).toEqual({
        "/obj/a": "must be string"
      });
    });

    it("should validate map value", () => {
      expect(
        lsp.validate({
          map: {
            a: 1
          }
        })
      ).toEqual({
        "/map/a": "must be string"
      });
    });

    it("should validate type", () => {
      expect(
        lsp.validate({
          obj: {
            a: 1
          }
        })
      ).toEqual({
        "/obj/a": "must be string"
      });
    });

    it("should validate enum", () => {
      expect(
        lsp.validate({
          obj: {
            a: "1",
            c: "1"
          }
        })
      ).toEqual({
        "/obj/c": "must be equal to one of the allowed values: X, Y, Z"
      });
    });

    it("should validate type in array", () => {
      expect(
        lsp.validate({
          arr: ["1", 2]
        })
      ).toEqual({
        "/arr/1": "must be string"
      });
    });

    it("should validate union with partial matched", () => {
      expect(
        lsp.validate({
          union: {
            type: "A",
            a: "1",
            undefined: "a"
          }
        })
      ).toEqual({
        "/union/undefined": "must NOT have additional properties"
      });
    });

    it("should validate union without match", () => {
      expect(
        lsp.validate({
          union: {
            type: "Undefined"
          }
        })
      ).toEqual({
        "/union": `must match exactly one schema in oneOf`
      });
    });
  });
});


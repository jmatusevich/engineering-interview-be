import { describe, expect, it, jest } from "@jest/globals";
import { contextFunctionForUsersDataSource } from "./context";

describe("context", () => {
  describe("contextFunctionForUsersDataSource()", () => {
    it("returns empty context if headers are not set", async () => {
      // eslint-disable-next-line
      const testedFunction = contextFunctionForUsersDataSource(null as any)!;
      if (typeof testedFunction !== "function") {
        throw new Error("it should be a function");
      }
      const context = await testedFunction({
        req: {
          headers: {},
        },
      } as any); // eslint-disable-line
      expect(context).toStrictEqual({ user: null });
    });
    it("returns a context with user if headers are set", async () => {
      const testedFunction = contextFunctionForUsersDataSource({
        getUserFromJWT: async () => "user",
      } as any)!; // eslint-disable-line
      if (typeof testedFunction !== "function") {
        throw new Error("it should be a function");
      }
      const context = await testedFunction({
        req: {
          headers: { authorization: "Bearer token" },
        },
      } as any); // eslint-disable-line
      expect(context).toStrictEqual({ user: "user" });
    });
    it("doesn't try to authorize if the header is incomplete", async () => {
      const getUserFromJWT = jest.fn();
      const testedFunction = contextFunctionForUsersDataSource({
        getUserFromJWT,
      } as any)!; // eslint-disable-line
      if (typeof testedFunction !== "function") {
        throw new Error("it should be a function");
      }
      await testedFunction({
        req: {
          headers: { authorization: "Bearer" },
        },
      } as any); // eslint-disable-line
      expect(getUserFromJWT).not.toHaveBeenCalled();
    });
    it("doesn't try to authorize if the header has a bad format", async () => {
      const getUserFromJWT = jest.fn();
      const testedFunction = contextFunctionForUsersDataSource({
        getUserFromJWT,
      } as any)!; // eslint-disable-line
      if (typeof testedFunction !== "function") {
        throw new Error("it should be a function");
      }
      await testedFunction({
        req: {
          headers: { authorization: "Something token" },
        },
      } as any); // eslint-disable-line
      expect(getUserFromJWT).not.toHaveBeenCalled();
    });
  });
});

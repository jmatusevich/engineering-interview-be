import { describe, expect, it, jest } from "@jest/globals";
import { Knex } from "knex";
import {
  isValidInt,
  isValidStatus,
  isValidString,
  mapSortEnumToKey,
  multiItemResponse,
  nextTaskPositionForUserIdSubQuery,
  optionalMultiItemResponse,
  reduceTasksToGroupsByStatus,
  singleItemResponse,
} from "./helpers";
import { SortEnum, TaskStatus } from "$/src/generated/graphql";
import { MOCKED_TASKS } from "./__mocks__";

describe("helpers", () => {
  describe("isValidInt()", () => {
    it("returns false for null or undefined values", () => {
      expect(isValidInt(null)).toBe(false);
      expect(isValidInt(undefined)).toBe(false);
    });
    it("returns false for floating point numbers", () => {
      expect(isValidInt(1.5)).toBe(false);
      expect(isValidInt(0.1)).toBe(false);
    });
    it("returns true for valid ints", () => {
      expect(isValidInt(1)).toBe(true);
      expect(isValidInt(123456)).toBe(true);
    });
  });

  describe("isValidString()", () => {
    it("returns false for null or undefined values", () => {
      expect(isValidString(null)).toBe(false);
      expect(isValidString(undefined)).toBe(false);
    });
    it("rejects empty strings by default", () => {
      expect(isValidString("")).toBe(false);
    });
    it("accepts strings of length 1 or more by default", () => {
      expect(isValidString("a")).toBe(true);
      expect(isValidString("abcd")).toBe(true);
    });
    it("rejects strings under the specified length", () => {
      expect(isValidString("abcd", 5)).toBe(false);
      expect(isValidString("abcdef", 7)).toBe(false);
      expect(isValidString("", 1)).toBe(false);
    });
    it("accepts strings of the specified length or more", () => {
      expect(isValidString("abcd", 4)).toBe(true);
      expect(isValidString("abcdef", 4)).toBe(true);
      expect(isValidString("", 0)).toBe(true);
    });
  });

  describe("isValidStatus()", () => {
    it("accepts all statuses in TaskStatus", () => {
      Object.values(TaskStatus).forEach((status) => {
        expect(isValidStatus(status)).toBe(true);
      });
    });
    it("rejects invalid statuses", () => {
      expect(isValidStatus("")).toBe(false);
      expect(isValidStatus("new-status")).toBe(false);
    });
  });

  describe("singleItemResponse()", () => {
    it("returns null if the array is empty", () => {
      expect(singleItemResponse([])).toBe(null);
    });
    it("returns the first item if the array is full", () => {
      expect(singleItemResponse(["a", "b", "c"])).toBe("a");
    });
    it("allows me to assume the type of the response with the generic type", () => {
      expect(
        // eslint-disable-next-line
        isValidStatus(singleItemResponse<TaskStatus>(["ARCHIVED" as any])!)
      ).toBe(true);
    });
  });

  describe("multiItemResponse()", () => {
    it("returns what it receives", () => {
      expect(multiItemResponse<string>(["a", "b"])).toEqual(["a", "b"]);
    });
    it("allows me to assume the type of the items in the response with the generic type", () => {
      expect(
        // eslint-disable-next-line
        isValidStatus(multiItemResponse<TaskStatus>(["ARCHIVED" as any])![0])
      ).toBe(true);
    });
  });

  describe("optionalMultiItemResponse()", () => {
    it("returns what it receives", () => {
      expect(optionalMultiItemResponse<string>(["a", "b"])).toEqual(["a", "b"]);
    });
    it("allows me to assume the type of the items in the response with the generic type", () => {
      expect(
        isValidStatus(
          // eslint-disable-next-line
          optionalMultiItemResponse<TaskStatus>(["ARCHIVED" as any])![0]
        )
      ).toBe(true);
    });
    it("accepts undefined values and turns them into null", () => {
      expect(optionalMultiItemResponse<TaskStatus>(undefined)).toBe(null);
    });
  });

  describe("nextTaskPositionForUserIdSubQuery()", () => {
    it("throws on invalid userId", () => {
      // eslint-disable-next-line
      expect(() => nextTaskPositionForUserIdSubQuery(null as any, 1.5)).toThrow(
        "InvalidId"
      );
    });
    it("builds a query for the next position of a task for a user id", () => {
      const knexMock = { raw: jest.fn() };
      // eslint-disable-next-line
      nextTaskPositionForUserIdSubQuery(knexMock as any as Knex, 1);
      expect(knexMock.raw.mock.calls).toMatchSnapshot();
    });
  });

  describe("reduceTasksToGroupsByStatus()", () => {
    it("groups tasks by status", () => {
      const tasks = MOCKED_TASKS;
      expect(reduceTasksToGroupsByStatus(tasks)).toMatchSnapshot();
    });
  });

  describe("mapSortEnumToKey()", () => {
    it("maps all possible sort enum values to the right db key", () => {
      expect(mapSortEnumToKey(SortEnum.CreatedAt)).toBe("createdAt");
      expect(mapSortEnumToKey(SortEnum.Order)).toBe("order");
      expect(mapSortEnumToKey(SortEnum.Status)).toBe("status");
      expect(mapSortEnumToKey(SortEnum.Title)).toBe("title");
      expect(mapSortEnumToKey(SortEnum.UpdatedAt)).toBe("updatedAt");
    });
    it("throws an error if an invalid sort key is provided", () => {
      // eslint-disable-next-line
      expect(() => mapSortEnumToKey("UNDEFINED_CRITERIA" as any)).toThrow(
        "InvalidSortKey"
      );
      // eslint-disable-next-line
      expect(() => mapSortEnumToKey(undefined as any)).toThrow(
        "InvalidSortKey"
      );
    });
  });
});

import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import TasksDataSource from "$/src/data-sources/database/tasks";
import { getTask } from ".";
import { TaskStatus } from "$/src/generated/graphql";
import { Mock } from "jest-mock";

type getTaskMockType = TasksDataSource["getTask"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithTaskIdAndContext(
  taskId: any, // eslint-disable-line
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, { taskId } as any, context, null as any];
}

describe("getTask()", () => {
  let context: Context;

  let getTaskMock: Mock;
  const response = {
    id: 1,
    title: "Some Task",
    description: "A Description",
    status: TaskStatus.ToDo,
    order: 6,
    userId: 1,
  };

  beforeEach(() => {
    getTaskMock = jest.fn().mockReturnValue(Promise.resolve(response));
    context = {
      user: {
        id: 1,
      } as User,
      dataSources: {
        tasks: {
          getTask: getTaskMock as getTaskMockType,
        } as TasksDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns null if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      getTask(...createMockedArgumentsWithTaskIdAndContext(null, context))
    ).resolves.toBe(null);
    context.user = { id: null } as unknown as User;
    expect(
      getTask(...createMockedArgumentsWithTaskIdAndContext(null, context))
    ).resolves.toBe(null);
  });

  it("returns null if no id is provided", () => {
    expect(
      getTask(...createMockedArgumentsWithTaskIdAndContext(null, context))
    ).resolves.toBe(null);
  });

  it("returns null if task does not belong to user", () => {
    context.user = { id: 2 } as User;
    expect(
      getTask(...createMockedArgumentsWithTaskIdAndContext(1, context))
    ).resolves.toBe(null);
  });

  it("returns null if task does not exist", () => {
    getTaskMock.mockReturnValueOnce(Promise.resolve(null));
    expect(
      getTask(...createMockedArgumentsWithTaskIdAndContext(1, context))
    ).resolves.toBe(null);
  });

  it("returns response with parameters", async () => {
    const result = await getTask(
      ...createMockedArgumentsWithTaskIdAndContext(1, context)
    );
    expect(result).toStrictEqual(response);
    expect(getTaskMock).toHaveBeenCalledWith(1);
  });
});

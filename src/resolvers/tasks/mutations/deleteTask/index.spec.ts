import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import TasksDataSource from "$/src/data-sources/database/tasks";
import { deleteTask } from ".";
import { TaskStatus } from "$/src/generated/graphql";
import { Mock } from "jest-mock";

type deleteTaskType = TasksDataSource["deleteTask"];
type getTaskType = TasksDataSource["getTask"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithTaskIdAndContext(
  taskId: any, // eslint-disable-line
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, { taskId } as any, context, null as any];
}

describe("deleteTask()", () => {
  let context: Context;

  let deleteTaskMock: Mock;
  let getTaskMock: Mock;
  const task = {
    id: 1,
    title: "Some Task",
    description: "A Description",
    status: TaskStatus.Done,
    userId: 1,
  };

  beforeEach(() => {
    deleteTaskMock = jest.fn().mockReturnValue(Promise.resolve(1));
    getTaskMock = jest.fn().mockReturnValue(Promise.resolve(task));
    context = {
      user: {
        id: 1,
      } as User,
      dataSources: {
        tasks: {
          deleteTask: deleteTaskMock as deleteTaskType,
          getTask: getTaskMock as getTaskType,
        } as TasksDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns false if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      deleteTask(...createMockedArgumentsWithTaskIdAndContext(null, context))
    ).resolves.toBe(false);
    context.user = { id: null } as unknown as User;
    expect(
      deleteTask(...createMockedArgumentsWithTaskIdAndContext(null, context))
    ).resolves.toBe(false);
  });

  it("returns false if an id is not passed", () => {
    expect(
      deleteTask(...createMockedArgumentsWithTaskIdAndContext(null, context))
    ).resolves.toBe(false);
  });

  it("returns true when everything is good", async () => {
    const success = await deleteTask(
      ...createMockedArgumentsWithTaskIdAndContext(1, context)
    );
    expect(success).toEqual(true);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(deleteTaskMock).toHaveBeenCalled();
  });

  it("returns false when task doesn't exist", () => {
    getTaskMock.mockReturnValueOnce(null);
    expect(
      deleteTask(...createMockedArgumentsWithTaskIdAndContext(1, context))
    ).resolves.toBe(false);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(deleteTaskMock).not.toHaveBeenCalled();
  });

  it("returns false when task doesn't belong to the user", () => {
    context.user = { id: 2 } as User;
    getTaskMock.mockReturnValueOnce(null);
    expect(
      deleteTask(...createMockedArgumentsWithTaskIdAndContext(1, context))
    ).resolves.toBe(false);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(deleteTaskMock).not.toHaveBeenCalled();
  });
});

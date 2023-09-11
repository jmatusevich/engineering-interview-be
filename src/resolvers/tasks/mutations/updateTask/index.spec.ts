import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import TasksDataSource from "$/src/data-sources/database/tasks";
import { updateTask } from ".";
import { TaskStatus } from "$/src/generated/graphql";
import { Mock } from "jest-mock";

type updateTaskMockType = TasksDataSource["updateTask"];
type getTaskType = TasksDataSource["getTask"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithTaskIdInputAndContext(
  taskId: any, // eslint-disable-line
  input: any, // eslint-disable-line
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, { taskId, input } as any, context, null as any];
}

describe("updateTask()", () => {
  let context: Context;

  let updateTaskMock: Mock;
  let getTaskMock: Mock;
  const task = {
    id: 1,
    title: "Some Task",
    description: "A Description",
    status: TaskStatus.Done,
    order: 6,
    userId: 1,
  };

  const response = {
    id: 1,
    title: "New Title",
    description: "A Description",
    status: TaskStatus.Done,
    order: 6,
    userId: 1,
  };

  beforeEach(() => {
    updateTaskMock = jest.fn().mockReturnValue(Promise.resolve(response));
    getTaskMock = jest.fn().mockReturnValue(Promise.resolve(task));
    context = {
      user: {
        id: 1,
      } as User,
      dataSources: {
        tasks: {
          updateTask: updateTaskMock as updateTaskMockType,
          getTask: getTaskMock as getTaskType,
        } as TasksDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns null if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      updateTask(
        ...createMockedArgumentsWithTaskIdInputAndContext(null, null, context)
      )
    ).resolves.toBe(null);
    context.user = { id: null } as unknown as User;
    expect(
      updateTask(
        ...createMockedArgumentsWithTaskIdInputAndContext(null, null, context)
      )
    ).resolves.toBe(null);
  });

  it("returns null if an id is not passed", () => {
    expect(
      updateTask(
        ...createMockedArgumentsWithTaskIdInputAndContext(null, null, context)
      )
    ).resolves.toBe(null);
  });
  it("returns null if no input is passed", () => {
    expect(
      updateTask(
        ...createMockedArgumentsWithTaskIdInputAndContext(1, null, context)
      )
    ).resolves.toBe(null);
  });

  it("returns response when everything is good", async () => {
    const input = { title: "New Title" };
    const result = await updateTask(
      ...createMockedArgumentsWithTaskIdInputAndContext(1, input, context)
    );
    expect(result).toStrictEqual(response);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(updateTaskMock).toHaveBeenCalledWith(1, context.user?.id, input);
  });

  it("returns null when a task doesn't exist", () => {
    getTaskMock.mockReturnValueOnce(Promise.resolve(null));
    const input = { title: "New Title" };
    expect(
      updateTask(
        ...createMockedArgumentsWithTaskIdInputAndContext(1, input, context)
      )
    ).resolves.toBe(null);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(updateTaskMock).not.toHaveBeenCalled();
  });

  it("returns null when task doesn't belong to the user", () => {
    context.user = { id: 2 } as User;
    const input = { title: "New Title" };
    expect(
      updateTask(
        ...createMockedArgumentsWithTaskIdInputAndContext(1, input, context)
      )
    ).resolves.toBe(null);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(updateTaskMock).not.toHaveBeenCalled();
  });
});

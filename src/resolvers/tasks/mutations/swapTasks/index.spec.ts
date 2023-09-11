import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import TasksDataSource from "$/src/data-sources/database/tasks";
import { swapTasks } from ".";
import { TaskStatus } from "$/src/generated/graphql";
import { Mock } from "jest-mock";

type swapTasksOrderMockType = TasksDataSource["swapTasksOrder"];
type getTaskType = TasksDataSource["getTask"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithTaskIdsAndContext(
  aTaskId: any, // eslint-disable-line
  bTaskId: any, // eslint-disable-line
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, { aTaskId, bTaskId } as any, context, null as any];
}

describe("swapTasks()", () => {
  let context: Context;

  let swapTasksOrderMock: Mock;
  let getTaskMock: Mock;
  const task = {
    id: 1,
    title: "Some Task",
    description: "A Description",
    status: TaskStatus.Done,
    order: 6,
    userId: 1,
  };

  const response = [
    {
      id: 1,
      order: 1,
      title: "Some Task",
      userId: 1,
    },
    {
      id: 2,
      order: 6,
      title: "Other Task",
      userId: 1,
    },
  ];
  beforeEach(() => {
    swapTasksOrderMock = jest.fn().mockReturnValue(Promise.resolve(response));
    getTaskMock = jest.fn().mockReturnValue(Promise.resolve(task));
    context = {
      user: {
        id: 1,
      } as User,
      dataSources: {
        tasks: {
          swapTasksOrder: swapTasksOrderMock as swapTasksOrderMockType,
          getTask: getTaskMock as getTaskType,
        } as TasksDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns null if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      swapTasks(
        ...createMockedArgumentsWithTaskIdsAndContext(null, null, context)
      )
    ).resolves.toBe(null);
    context.user = { id: null } as unknown as User;
    expect(
      swapTasks(
        ...createMockedArgumentsWithTaskIdsAndContext(null, null, context)
      )
    ).resolves.toBe(null);
  });

  it("returns null if an id is not passed", () => {
    expect(
      swapTasks(
        ...createMockedArgumentsWithTaskIdsAndContext(null, null, context)
      )
    ).resolves.toBe(null);
    expect(
      swapTasks(...createMockedArgumentsWithTaskIdsAndContext(1, null, context))
    ).resolves.toBe(null);
    expect(
      swapTasks(...createMockedArgumentsWithTaskIdsAndContext(null, 2, context))
    ).resolves.toBe(null);
  });

  it("returns response when everything is good", async () => {
    const result = await swapTasks(
      ...createMockedArgumentsWithTaskIdsAndContext(1, 2, context)
    );
    expect(result).toStrictEqual(response);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(swapTasksOrderMock).toHaveBeenCalledWith(1, 2, context.user?.id);
  });

  it("returns null when a task doesn't exist", () => {
    getTaskMock.mockReturnValueOnce(Promise.resolve(null));
    expect(
      swapTasks(...createMockedArgumentsWithTaskIdsAndContext(1, 2, context))
    ).resolves.toBe(null);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(swapTasksOrderMock).not.toHaveBeenCalled();
    getTaskMock.mockReturnValue(Promise.resolve(null));
    expect(
      swapTasks(...createMockedArgumentsWithTaskIdsAndContext(1, 2, context))
    ).resolves.toBe(null);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(swapTasksOrderMock).not.toHaveBeenCalled();
  });

  it("returns null when task doesn't belong to the user", () => {
    context.user = { id: 2 } as User;
    expect(
      swapTasks(...createMockedArgumentsWithTaskIdsAndContext(1, 2, context))
    ).resolves.toBe(null);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(swapTasksOrderMock).not.toHaveBeenCalled();
  });
});

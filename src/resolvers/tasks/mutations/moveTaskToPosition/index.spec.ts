import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import TasksDataSource from "$/src/data-sources/database/tasks";
import { moveTaskToPosition } from ".";
import { TaskStatus } from "$/src/generated/graphql";
import { Mock } from "jest-mock";

type moveTaskToPositionType = TasksDataSource["moveTaskToPosition"];
type getTaskType = TasksDataSource["getTask"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithTaskIdPositionAndContext(
  taskId: any, // eslint-disable-line
  position: any, // eslint-disable-line
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, { taskId, position } as any, context, null as any];
}

describe("moveTaskToPosition()", () => {
  let context: Context;

  let moveTaskToPositionMock: Mock;
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
      order: 4,
      title: "Some Task",
    },
    {
      id: 5,
      title: "Some Task",
    },
    {
      id: 6,
      title: "Some Task",
    },
  ];
  beforeEach(() => {
    moveTaskToPositionMock = jest
      .fn()
      .mockReturnValue(Promise.resolve(response));
    getTaskMock = jest.fn().mockReturnValue(Promise.resolve(task));
    context = {
      user: {
        id: 1,
      } as User,
      dataSources: {
        tasks: {
          moveTaskToPosition: moveTaskToPositionMock as moveTaskToPositionType,
          getTask: getTaskMock as getTaskType,
        } as TasksDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns false if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      moveTaskToPosition(
        ...createMockedArgumentsWithTaskIdPositionAndContext(
          null,
          null,
          context
        )
      )
    ).resolves.toBe(null);
    context.user = { id: null } as unknown as User;
    expect(
      moveTaskToPosition(
        ...createMockedArgumentsWithTaskIdPositionAndContext(
          null,
          null,
          context
        )
      )
    ).resolves.toBe(null);
  });

  it("returns null if id is not passed", () => {
    expect(
      moveTaskToPosition(
        ...createMockedArgumentsWithTaskIdPositionAndContext(
          null,
          null,
          context
        )
      )
    ).resolves.toBe(null);
  });

  it("returns null if position is not passed", () => {
    expect(
      moveTaskToPosition(
        ...createMockedArgumentsWithTaskIdPositionAndContext(1, null, context)
      )
    ).resolves.toBe(null);
  });

  it("returns response when everything is good", async () => {
    const result = await moveTaskToPosition(
      ...createMockedArgumentsWithTaskIdPositionAndContext(1, 4, context)
    );
    expect(result).toStrictEqual(response);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(moveTaskToPositionMock).toHaveBeenCalledWith(1, 4, context.user?.id);
  });

  it("returns null when task doesn't exist", () => {
    getTaskMock.mockReturnValueOnce(Promise.resolve(null));
    expect(
      moveTaskToPosition(
        ...createMockedArgumentsWithTaskIdPositionAndContext(1, 4, context)
      )
    ).resolves.toBe(null);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(moveTaskToPositionMock).not.toHaveBeenCalled();
  });

  it("returns null when task doesn't belong to the user", () => {
    context.user = { id: 2 } as User;
    expect(
      moveTaskToPosition(
        ...createMockedArgumentsWithTaskIdPositionAndContext(1, 4, context)
      )
    ).resolves.toBe(null);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(moveTaskToPositionMock).not.toHaveBeenCalled();
  });

  it("returns null when moving to same position as task", () => {
    expect(
      moveTaskToPosition(
        ...createMockedArgumentsWithTaskIdPositionAndContext(1, 6, context)
      )
    ).resolves.toBe(null);
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(moveTaskToPositionMock).not.toHaveBeenCalled();
  });

  it("throws error when rows are not updated unexpectedly", async () => {
    moveTaskToPositionMock.mockReturnValueOnce(Promise.resolve(null));
    let errorReceived: Error | undefined;
    try {
      await moveTaskToPosition(
        ...createMockedArgumentsWithTaskIdPositionAndContext(1, 4, context)
      );
      errorReceived;
    } catch (error) {
      errorReceived = error as Error;
    }
    expect(errorReceived?.message).toBe("UnknownError");
    expect(getTaskMock).toHaveBeenCalledWith(1);
    expect(moveTaskToPositionMock).toHaveBeenCalled();
  });
});

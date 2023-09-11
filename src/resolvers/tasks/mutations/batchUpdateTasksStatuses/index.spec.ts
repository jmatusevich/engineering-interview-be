import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import TasksDataSource from "$/src/data-sources/database/tasks";
import { batchUpdateTasksStatuses } from ".";
import { TaskStatus } from "$/src/generated/graphql";
import { Mock } from "jest-mock";

type updateTasksStatusesType = TasksDataSource["updateTasksStatuses"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithQueryAndContext(
  taskIds: any, // eslint-disable-line
  status: any, // eslint-disable-line
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, { taskIds, status } as any, context, null as any];
}
describe("batchUpdateTasksStatuses()", () => {
  let context: Context;

  const response = [
    {
      id: 1,
      title: "Some Task",
    },
  ];
  let updateTasksStatusesMock: Mock;
  beforeEach(() => {
    updateTasksStatusesMock = jest
      .fn()
      .mockReturnValue(Promise.resolve(response));
    context = {
      user: {
        id: 1,
      } as User,
      dataSources: {
        tasks: {
          updateTasksStatuses:
            updateTasksStatusesMock as updateTasksStatusesType,
        } as TasksDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns null if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      batchUpdateTasksStatuses(
        ...createMockedArgumentsWithQueryAndContext([], "", context)
      )
    ).resolves.toBe(null);
    context.user = { id: null } as unknown as User;
    expect(
      batchUpdateTasksStatuses(
        ...createMockedArgumentsWithQueryAndContext([], "", context)
      )
    ).resolves.toBe(null);
  });

  it("returns null if a status is not passed", () => {
    expect(
      batchUpdateTasksStatuses(
        ...createMockedArgumentsWithQueryAndContext([], undefined, context)
      )
    ).resolves.toBe(null);
  });

  it("returns null if taskids are missing or empty", () => {
    expect(
      batchUpdateTasksStatuses(
        ...createMockedArgumentsWithQueryAndContext([], "", context)
      )
    ).resolves.toBe(null);
    expect(
      batchUpdateTasksStatuses(
        ...createMockedArgumentsWithQueryAndContext(null, "", context)
      )
    ).resolves.toBe(null);
  });

  it("returns the value of updateTasksStatuses when everything is good", () => {
    const taskIds = [1, 2, 3];
    const status = TaskStatus.Archived;
    expect(
      batchUpdateTasksStatuses(
        ...createMockedArgumentsWithQueryAndContext(taskIds, status, context)
      )
    ).resolves.toStrictEqual(response);
    expect(updateTasksStatusesMock).toHaveBeenCalledWith(
      taskIds,
      status,
      context.user?.id
    );
  });
});

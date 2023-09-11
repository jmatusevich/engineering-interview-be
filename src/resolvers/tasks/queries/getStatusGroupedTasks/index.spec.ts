import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import TasksDataSource from "$/src/data-sources/database/tasks";
import { getStatusGroupedTasks } from ".";
import { SortEnum, TaskStatus } from "$/src/generated/graphql";
import { Mock } from "jest-mock";

type getStatusGroupedTasksForUserIdMockType =
  TasksDataSource["getStatusGroupedTasksForUserId"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithSortFilterAndContext(
  sortedBy: any, // eslint-disable-line
  filteredBy: any, // eslint-disable-line
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [
    null as any,
    { sortedBy, withStatuses: filteredBy } as any,
    context,
    null as any,
  ];
}

describe("getStatusGroupedTasks()", () => {
  let context: Context;

  let getStatusGroupedTasksForUserIdMock: Mock;
  const response = {
    TO_DO: [
      {
        id: 1,
        title: "Some Task",
        description: "A Description",
        status: TaskStatus.ToDo,
        order: 6,
        userId: 1,
      },
    ],
  };

  beforeEach(() => {
    getStatusGroupedTasksForUserIdMock = jest
      .fn()
      .mockReturnValue(Promise.resolve(response));
    context = {
      user: {
        id: 1,
      } as User,
      dataSources: {
        tasks: {
          getStatusGroupedTasksForUserId:
            getStatusGroupedTasksForUserIdMock as getStatusGroupedTasksForUserIdMockType,
        } as TasksDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns null if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      getStatusGroupedTasks(
        ...createMockedArgumentsWithSortFilterAndContext(null, null, context)
      )
    ).resolves.toBe(null);
    context.user = { id: null } as unknown as User;
    expect(
      getStatusGroupedTasks(
        ...createMockedArgumentsWithSortFilterAndContext(null, null, context)
      )
    ).resolves.toBe(null);
  });

  it("returns response without any parameters", async () => {
    const result = await getStatusGroupedTasks(
      ...createMockedArgumentsWithSortFilterAndContext(null, null, context)
    );
    expect(result).toStrictEqual(response);
    expect(getStatusGroupedTasksForUserIdMock).toHaveBeenCalledWith(
      context.user?.id,
      null,
      null
    );
  });
  it("returns response with parameters", async () => {
    const sortedBy = [SortEnum.CreatedAt];
    const filteredBy = [TaskStatus.Archived];
    const result = await getStatusGroupedTasks(
      ...createMockedArgumentsWithSortFilterAndContext(
        sortedBy,
        filteredBy,
        context
      )
    );
    expect(result).toStrictEqual(response);
    expect(getStatusGroupedTasksForUserIdMock).toHaveBeenCalledWith(
      context.user?.id,
      sortedBy,
      filteredBy
    );
  });
});

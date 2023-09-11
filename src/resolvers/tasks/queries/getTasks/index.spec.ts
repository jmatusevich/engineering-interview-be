import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import TasksDataSource from "$/src/data-sources/database/tasks";
import { getTasks } from ".";
import { SortEnum, TaskStatus } from "$/src/generated/graphql";
import { Mock } from "jest-mock";

type getTasksForUserIdMockType = TasksDataSource["getTasksForUserId"];
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

describe("getTasks()", () => {
  let context: Context;

  let getTasksForUserIdMock: Mock;
  const response = [
    {
      id: 1,
      title: "Some Task",
      description: "A Description",
      status: TaskStatus.ToDo,
      order: 6,
      userId: 1,
    },
  ];

  beforeEach(() => {
    getTasksForUserIdMock = jest
      .fn()
      .mockReturnValue(Promise.resolve(response));
    context = {
      user: {
        id: 1,
      } as User,
      dataSources: {
        tasks: {
          getTasksForUserId: getTasksForUserIdMock as getTasksForUserIdMockType,
        } as TasksDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns null if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      getTasks(
        ...createMockedArgumentsWithSortFilterAndContext(null, null, context)
      )
    ).resolves.toBe(null);
    context.user = { id: null } as unknown as User;
    expect(
      getTasks(
        ...createMockedArgumentsWithSortFilterAndContext(null, null, context)
      )
    ).resolves.toBe(null);
  });

  it("returns response without any parameters", async () => {
    const result = await getTasks(
      ...createMockedArgumentsWithSortFilterAndContext(null, null, context)
    );
    expect(result).toStrictEqual(response);
    expect(getTasksForUserIdMock).toHaveBeenCalledWith(
      context.user?.id,
      null,
      null
    );
  });
  it("returns response with parameters", async () => {
    const sortedBy = [SortEnum.CreatedAt];
    const filteredBy = [TaskStatus.Archived];
    const result = await getTasks(
      ...createMockedArgumentsWithSortFilterAndContext(
        sortedBy,
        filteredBy,
        context
      )
    );
    expect(result).toStrictEqual(response);
    expect(getTasksForUserIdMock).toHaveBeenCalledWith(
      context.user?.id,
      sortedBy,
      filteredBy
    );
  });
});

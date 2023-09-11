import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import TasksDataSource from "$/src/data-sources/database/tasks";
import { createTask } from ".";
import { TaskStatus } from "$/src/generated/graphql";
import { Mock } from "jest-mock";

type createTaskType = TasksDataSource["createTask"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithInputAndContext(
  input: any, // eslint-disable-line
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, { input } as any, context, null as any];
}

describe("createTask()", () => {
  let context: Context;

  const response = {
    id: 1,
    title: "Some Task",
    description: "A Description",
    status: TaskStatus.Done,
    userId: 1,
  };

  let createTaskMock: Mock;

  beforeEach(() => {
    createTaskMock = jest.fn().mockReturnValue(Promise.resolve(response));
    context = {
      user: {
        id: 1,
      } as User,
      dataSources: {
        tasks: {
          createTask: createTaskMock as createTaskType,
        } as TasksDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns null if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      createTask(...createMockedArgumentsWithInputAndContext(null, context))
    ).resolves.toBe(null);
    context.user = { id: null } as unknown as User;
    expect(
      createTask(...createMockedArgumentsWithInputAndContext(null, context))
    ).resolves.toBe(null);
  });

  it("returns null if an input is not passed", () => {
    expect(
      createTask(...createMockedArgumentsWithInputAndContext(null, context))
    ).resolves.toBe(null);
  });

  it("returns the value of response when everything is good", () => {
    expect(
      createTask(
        ...createMockedArgumentsWithInputAndContext(
          {
            title: response.title,
            description: response.description,
            status: response.status,
          },
          context
        )
      )
    ).resolves.toStrictEqual(response);
    expect(createTaskMock).toHaveBeenCalledWith({
      title: response.title,
      description: response.description,
      status: response.status,
      userId: context.user?.id,
    });
  });
  it("defaults status to ToDo when missing", async () => {
    await createTask(
      ...createMockedArgumentsWithInputAndContext(
        {
          title: response.title,
          description: response.description,
        },
        context
      )
    );
    expect(createTaskMock).toHaveBeenCalledWith({
      title: response.title,
      description: response.description,
      status: TaskStatus.ToDo,
      userId: context.user?.id,
    });
  });
});

import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import { deleteUser } from ".";
import { Mock } from "jest-mock";
import UsersDataSource from "$/src/data-sources/database/users";

type deleteUserMockType = UsersDataSource["deleteUser"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithContext(
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, {} as any, context, null as any];
}

describe("deleteUser()", () => {
  let context: Context;

  let deleteUserMock: Mock;

  beforeEach(() => {
    deleteUserMock = jest.fn().mockReturnValue(Promise.resolve(1));
    context = {
      user: {
        id: 1,
      } as User,
      dataSources: {
        users: {
          deleteUser: deleteUserMock as deleteUserMockType,
        } as UsersDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns null if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      deleteUser(...createMockedArgumentsWithContext(context))
    ).resolves.toBe(false);
    context.user = { id: null } as unknown as User;
    expect(
      deleteUser(...createMockedArgumentsWithContext(context))
    ).resolves.toBe(false);
  });

  it("returns true when deleting everything", async () => {
    const result = await deleteUser(
      ...createMockedArgumentsWithContext(context)
    );

    expect(result).toStrictEqual(true);
    expect(deleteUserMock).toHaveBeenCalledWith(context.user?.id);
  });

  it("returns false when deletion is empty", async () => {
    deleteUserMock.mockReturnValueOnce(Promise.resolve(0));
    const result = await deleteUser(
      ...createMockedArgumentsWithContext(context)
    );

    expect(result).toStrictEqual(false);
    expect(deleteUserMock).toHaveBeenCalledWith(context.user?.id);
  });

  it("returns false when having unexpected error", async () => {
    deleteUserMock.mockReturnValueOnce(Promise.reject(new Error()));
    const result = await deleteUser(
      ...createMockedArgumentsWithContext(context)
    );

    expect(result).toStrictEqual(false);
    expect(deleteUserMock).toHaveBeenCalledWith(context.user?.id);
  });
});

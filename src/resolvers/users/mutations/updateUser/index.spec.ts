import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import { updateUser } from ".";
import { Mock } from "jest-mock";
import UsersDataSource from "$/src/data-sources/database/users";

type updateUserMockType = UsersDataSource["updateUser"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithInputAndContext(
  input: any, // eslint-disable-line
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, { input } as any, context, null as any];
}

describe("updateUser()", () => {
  let context: Context;

  let updateUserMock: Mock;
  const user = {
    id: 1,
  } as User;

  beforeEach(() => {
    updateUserMock = jest.fn().mockReturnValue(Promise.resolve(user));
    context = {
      user,
      dataSources: {
        users: {
          updateUser: updateUserMock as updateUserMockType,
        } as UsersDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns null if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      updateUser(...createMockedArgumentsWithInputAndContext(null, context))
    ).resolves.toBe(null);
    context.user = { id: null } as unknown as User;
    expect(
      updateUser(...createMockedArgumentsWithInputAndContext(null, context))
    ).resolves.toBe(null);
  });

  it("returns null if an input is not passed", () => {
    expect(
      updateUser(...createMockedArgumentsWithInputAndContext(null, context))
    ).resolves.toBe(null);
  });

  it("throws if the old password is not passed and a new password is", () => {
    expect(
      updateUser(
        ...createMockedArgumentsWithInputAndContext(
          {
            username: "john",
            passwordDetails: {
              password: "pwd",
              passwordRepeated: "pwd",
              oldPassword: null,
            },
          },
          context
        )
      )
    ).rejects.toEqual(new Error("MissingFields"));
  });

  it("throws if passwords don't match", () => {
    expect(
      updateUser(
        ...createMockedArgumentsWithInputAndContext(
          {
            username: "john",
            passwordDetails: {
              password: "pwd",
              passwordRepeated: "pawd",
              oldPassword: "1234",
            },
          },
          context
        )
      )
    ).rejects.toEqual(new Error("PasswordMismatch"));
  });

  it("returns user when updating everything", async () => {
    const result = await updateUser(
      ...createMockedArgumentsWithInputAndContext(
        {
          username: "john",
          passwordDetails: {
            password: "pwd",
            passwordRepeated: "pwd",
            oldPassword: "1234",
          },
        },
        context
      )
    );

    expect(result).toStrictEqual(user);
    expect(updateUserMock).toHaveBeenCalledWith(context.user?.id, {
      username: "john",
      password: "pwd",
      oldPassword: "1234",
    });
  });

  it("returns user when updating username", async () => {
    const result = await updateUser(
      ...createMockedArgumentsWithInputAndContext(
        {
          username: "john",
        },
        context
      )
    );

    expect(result).toStrictEqual(user);
    expect(updateUserMock).toHaveBeenCalledWith(context.user?.id, {
      username: "john",
    });
  });

  it("returns user when updating password", async () => {
    const result = await updateUser(
      ...createMockedArgumentsWithInputAndContext(
        {
          passwordDetails: {
            password: "pwd",
            passwordRepeated: "pwd",
            oldPassword: "1234",
          },
        },
        context
      )
    );

    expect(result).toStrictEqual(user);
    expect(updateUserMock).toHaveBeenCalledWith(context.user?.id, {
      password: "pwd",
      oldPassword: "1234",
    });
  });

  it("throws error when user unexpectedly can't be updated", () => {
    updateUserMock.mockReturnValueOnce(Promise.resolve(null));
    expect(
      updateUser(
        ...createMockedArgumentsWithInputAndContext(
          {
            passwordDetails: {
              password: "pwd",
              passwordRepeated: "pwd",
              oldPassword: "1234",
            },
          },
          context
        )
      )
    ).rejects.toEqual(new Error("UserUpdateError"));
  });
});

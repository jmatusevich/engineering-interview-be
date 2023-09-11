import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import { createUser } from ".";
import { Mock } from "jest-mock";
import UsersDataSource from "$/src/data-sources/database/users";

type createUserMockType = UsersDataSource["createUser"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithInputAndContext(
  input: any, // eslint-disable-line
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, { input } as any, context, null as any];
}

describe("createUser()", () => {
  let context: Context;

  let createUserMock: Mock;
  const user = {
    id: 1,
  } as User;

  beforeEach(() => {
    createUserMock = jest.fn().mockReturnValue(Promise.resolve(user));
    context = {
      user,
      dataSources: {
        users: {
          createUser: createUserMock as createUserMockType,
        } as UsersDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("throws if a username is not passed", () => {
    expect(
      createUser(
        ...createMockedArgumentsWithInputAndContext({ username: null }, context)
      )
    ).rejects.toEqual(new Error("MissingUsername"));
  });
  it("throws if a password is not passed", () => {
    expect(
      createUser(
        ...createMockedArgumentsWithInputAndContext(
          { username: "john", password: null },
          context
        )
      )
    ).rejects.toEqual(new Error("MissingPassword"));
  });

  it("throws if passwords don't match", () => {
    expect(
      createUser(
        ...createMockedArgumentsWithInputAndContext(
          { username: "john", password: "pwd", passwordRepeated: "pawd" },
          context
        )
      )
    ).rejects.toEqual(new Error("PasswordMismatch"));
  });

  it("returns user when everything is good", async () => {
    const result = await createUser(
      ...createMockedArgumentsWithInputAndContext(
        { username: "john", password: "pwd", passwordRepeated: "pwd" },
        context
      )
    );

    expect(result).toStrictEqual(user);
    expect(createUserMock).toHaveBeenCalledWith({
      username: "john",
      password: "pwd",
    });
  });

  it("returns null when user unexpectedly can't be authenticated", () => {
    createUserMock.mockReturnValueOnce(Promise.resolve(null));
    expect(
      createUser(
        ...createMockedArgumentsWithInputAndContext(
          { username: "john", password: "pwd", passwordRepeated: "pwd" },
          context
        )
      )
    ).rejects.toEqual(new Error("CreationError"));
  });
});

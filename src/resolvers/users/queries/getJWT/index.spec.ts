import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import { getJWT } from ".";
import { Mock } from "jest-mock";
import UsersDataSource from "$/src/data-sources/database/users";

type getJWTMockType = UsersDataSource["getJWT"];
type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithUsernamePasswordAndContext(
  username: any, // eslint-disable-line
  password: any, // eslint-disable-line
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, { username, password } as any, context, null as any];
}

describe("getJWT()", () => {
  let context: Context;

  let getJWTMock: Mock;
  const response = "SOMEJWT";

  beforeEach(() => {
    getJWTMock = jest.fn().mockReturnValue(Promise.resolve(response));
    context = {
      user: {
        id: 1,
      } as User,
      dataSources: {
        users: {
          getJWT: getJWTMock as getJWTMockType,
        } as UsersDataSource,
      } as ContextDataSourcesTypes,
    };
  });

  it("returns null if a username is not passed", () => {
    expect(
      getJWT(
        ...createMockedArgumentsWithUsernamePasswordAndContext(
          null,
          "some",
          context
        )
      )
    ).resolves.toBe(null);
  });
  it("returns null if a password is not passed", () => {
    expect(
      getJWT(
        ...createMockedArgumentsWithUsernamePasswordAndContext(
          "user",
          null,
          context
        )
      )
    ).resolves.toBe(null);
  });

  it("returns response when everything is good", async () => {
    const result = await getJWT(
      ...createMockedArgumentsWithUsernamePasswordAndContext(
        "user",
        "password",
        context
      )
    );
    expect(result).toStrictEqual(response);
    expect(getJWTMock).toHaveBeenCalledWith("user", "password");
  });

  it("returns null when a user can't be authenticated", () => {
    getJWTMock.mockReturnValueOnce(Promise.resolve(null));
    expect(
      getJWT(
        ...createMockedArgumentsWithUsernamePasswordAndContext(
          "user",
          "pass",
          context
        )
      )
    ).resolves.toBe(null);
    expect(getJWTMock).toHaveBeenCalledWith("user", "pass");
  });
});

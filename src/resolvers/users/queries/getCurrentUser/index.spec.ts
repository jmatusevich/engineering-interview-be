import { describe, expect, it, beforeEach } from "@jest/globals";
import { Context, User } from "$/src/types";
import { getCurrentUser } from ".";

type ContextDataSourcesTypes = Context["dataSources"];

function createMockedArgumentsWithContext(
  context: Context
  // eslint-disable-next-line
): [any, any, any, any] {
  // eslint-disable-next-line
  return [null as any, null as any, context, null as any];
}

describe("getCurrentUser()", () => {
  let context: Context;

  const user = {
    id: 1,
  };

  beforeEach(() => {
    context = {
      user: user as User,
      dataSources: {} as ContextDataSourcesTypes,
    };
  });

  it("returns null if the user is not defined or valid", () => {
    context.user = undefined;
    expect(
      getCurrentUser(...createMockedArgumentsWithContext(context))
    ).resolves.toBe(null);
    context.user = { id: null } as unknown as User;
    expect(
      getCurrentUser(...createMockedArgumentsWithContext(context))
    ).resolves.toBe(null);
  });

  it("returns user", async () => {
    const result = await getCurrentUser(
      ...createMockedArgumentsWithContext(context)
    );
    expect(result).toStrictEqual(user);
  });
});

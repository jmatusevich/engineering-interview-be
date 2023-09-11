import { MutationResolvers } from "$/src/generated/graphql";
import logger from "$/src/logger";
export const createUser: Extract<
  MutationResolvers["createUser"],
  Function // eslint-disable-line
> = async (_, { input }, context) => {
  if (!input) {
    logger.info("create with no input");
    return null;
  }
  const { username, password, passwordRepeated } = input;
  const childLogger = logger.child({
    username,
  });
  if (!username) {
    childLogger.info("user tried to create without username");
    throw new Error("MissingUsername");
  }
  if (!password || !password.length) {
    childLogger.info("user tried to create with no password");
    throw new Error("MissingPassword");
  }
  if (password !== passwordRepeated) {
    childLogger.info("user tried to create with mismatching passwords");
    throw new Error("PasswordMismatch");
  }
  childLogger.info("user creating account");
  const user = await context.dataSources.users.createUser({
    username,
    password,
  });
  if (!user) {
    childLogger.info("user failed to create user");
    throw new Error("CreationError");
  }
  childLogger.info("user succeeded creating account", {
    userId: user.id,
  });
  return user;
};

import { MutationResolvers } from "$/src/generated/graphql";
import logger from "$/src/logger";
export const updateUser: Extract<
  MutationResolvers["updateUser"],
  Function // eslint-disable-line
> = async (_, { input }, context) => {
  if (!context.user || !context.user.id) {
    logger.info("unauthenticated user tried to do a user update");
    return null;
  }
  const userId = context.user.id;
  const childLogger = logger.child({
    userId,
    username: input?.username,
  });

  if (!input) {
    childLogger.info("update with no input");
    return null;
  }

  const { username, passwordDetails } = input;

  const { password, passwordRepeated, oldPassword } = passwordDetails ?? {};
  let passwordFields = {};
  if (passwordDetails && Object.values(passwordDetails).length !== 0) {
    if (!oldPassword) {
      childLogger.info("user tried to update pwd without old password");
      throw new Error("MissingFields");
    }
    if (!password) {
      childLogger.info("user tried to update pwd without password value");
      throw new Error("MissingFields");
    }
    if (password !== passwordRepeated) {
      childLogger.info("user tried to update with mismatching new passwords");
      throw new Error("PasswordMismatch");
    }
    childLogger.info("user updating password");
    passwordFields = {
      password,
      oldPassword,
    };
  }

  if (username) {
    childLogger.info("user updating username");
  }

  const user = await context.dataSources.users.updateUser(context.user.id, {
    username: username ?? undefined,
    ...passwordFields,
  });
  if (!user) {
    childLogger.warn("user had unexpected issue updating user");
    throw new Error("UserUpdateError");
  }
  return user;
};

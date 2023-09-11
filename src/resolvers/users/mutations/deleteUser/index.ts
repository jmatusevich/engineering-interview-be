import { MutationResolvers } from "$/src/generated/graphql";
import logger from "$/src/logger";
export const deleteUser: Extract<
  MutationResolvers["deleteUser"],
  Function // eslint-disable-line
> = async (_, __, context) => {
  if (!context.user || !context.user.id) {
    logger.info(`unauthenticated user tried to delete an account`);
    return false;
  }
  const userId = context.user.id;
  const childLogger = logger.child({
    userId,
  });
  childLogger.info("user is trying to delete account");
  try {
    const alteredRows = await context.dataSources.users.deleteUser(
      context.user.id
    );
    childLogger.info("user succeeded to delete account");
    return alteredRows === 1;
  } catch (error) {
    childLogger.info("user had unexpected error deleting account", {
      message: (error as Error)?.message,
      error,
    });
    return false;
  }
};

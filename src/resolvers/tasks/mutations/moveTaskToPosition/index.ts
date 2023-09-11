import { MutationResolvers } from "$/src/generated/graphql";
import logger from "$/src/logger";
export const moveTaskToPosition: Extract<
  MutationResolvers["moveTaskToPosition"],
  Function // eslint-disable-line
> = async (_, { taskId, position }, context) => {
  if (!context.user || !context.user.id) {
    logger.info("unauthenticated task creation attempt");
    return null;
  }

  const userId = context.user.id;
  const childLogger = logger.child({
    taskId,
    position,
    userId,
  });

  if (!taskId) {
    childLogger.info("move position with no task");
    return null;
  }

  if (position === null || position === undefined) {
    childLogger.info("update with no new position");
    return null;
  }

  const task = await context.dataSources.tasks.getTask(taskId);

  if (!task || task.userId !== context.user.id) {
    childLogger.info("unauthorized task deletion: wrong user", {
      userId: context.user.id,
      taskId,
    });
    return null;
  }

  if (task.order === position) {
    childLogger.info("No-op move of task: same origin as destination");
    return null;
  }

  const updatedRows = await context.dataSources.tasks.moveTaskToPosition(
    taskId,
    position,
    userId
  );
  if (!updatedRows) {
    childLogger.error("move rows: Error during transaction");
    throw new Error("UnknownError");
  }
  return updatedRows;
};

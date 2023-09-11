import { MutationResolvers } from "$/src/generated/graphql";
import logger from "$/src/logger";
export const swapTasks: Extract<
  MutationResolvers["swapTasks"],
  Function // eslint-disable-line
> = async (_, { aTaskId, bTaskId }, context) => {
  if (!context.user || !context.user.id) {
    logger.info("unauthenticated task creation attempt");
    return null;
  }
  const userId = context.user.id;
  const childLogger = logger.child({
    aTaskId,
    bTaskId,
    userId,
  });
  if (!aTaskId) {
    childLogger.info("update with no task a");
    return null;
  }
  if (!bTaskId) {
    childLogger.info("update with no task b");
    return null;
  }

  const tasks = await Promise.all([
    context.dataSources.tasks.getTask(aTaskId),
    context.dataSources.tasks.getTask(bTaskId),
  ]);
  if (!tasks || tasks.length !== 2) {
    childLogger.info("invalid task update: invalid tasks");
    return null;
  }

  if (tasks.some((aTask) => !aTask || aTask?.userId !== userId)) {
    childLogger.info("invalid task update: unauthorized or invalid tasks");
    return null;
  }

  return await context.dataSources.tasks.swapTasksOrder(
    aTaskId,
    bTaskId,
    userId
  );
};

import { MutationResolvers } from "$/src/generated/graphql";
import logger from "$/src/logger";
export const batchUpdateTasksStatuses: Extract<
  MutationResolvers["batchUpdateTasksStatuses"],
  Function // eslint-disable-line
> = async (_, { taskIds, status }, context) => {
  if (!context.user || !context.user.id) {
    logger.info("unauthenticated batch task update attempt", {
      taskIds,
    });
    return null;
  }
  const userId = context.user.id;
  const childLogger = logger.child({
    taskIds,
    status,
    userId,
  });
  if (!status) {
    childLogger.info("batch update with no new status");
    return null;
  }
  if (!taskIds || taskIds.length === 0) {
    childLogger.info("batch update with no task ids");
    return null;
  }

  return await context.dataSources.tasks.updateTasksStatuses(
    taskIds,
    status,
    userId
  );
};

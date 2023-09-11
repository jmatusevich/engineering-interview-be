import { QueryResolvers, SortEnum, TaskStatus } from "$/src/generated/graphql";
import logger from "$/src/logger";

export const getStatusGroupedTasks: Extract<
  QueryResolvers["getStatusGroupedTasks"],
  Function // eslint-disable-line
> = async (_, { sortedBy, withStatuses: filteredBy }, context) => {
  if (!context.user || !context.user.id) {
    logger.info("unauthenticated task accessing attempt");
    return null;
  }
  const userId = context.user.id;

  logger.info("user accessing grouped tasks", {
    sortedBy,
    filteredBy,
    userId,
  });

  return context.dataSources.tasks.getStatusGroupedTasksForUserId(
    context.user.id,
    sortedBy as SortEnum[],
    filteredBy as TaskStatus[]
  );
};

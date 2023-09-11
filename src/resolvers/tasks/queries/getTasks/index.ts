import { QueryResolvers, SortEnum, TaskStatus } from "$/src/generated/graphql";
import logger from "$/src/logger";

// eslint-disable-next-line
export const getTasks: Extract<QueryResolvers["getTasks"], Function> = async (
  _,
  { sortedBy, withStatuses: filteredBy },
  context
) => {
  if (!context.user || !context.user.id) {
    logger.info("unauthenticated task accessing attempt");
    return null;
  }

  const userId = context.user.id;
  logger.info("user accessing tasks", {
    sortedBy,
    filteredBy,
    userId,
  });

  const tasks = await context.dataSources.tasks.getTasksForUserId(
    userId,
    sortedBy as SortEnum[],
    filteredBy as TaskStatus[]
  );

  return tasks;
};

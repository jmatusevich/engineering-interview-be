import { QueryResolvers } from "$/src/generated/graphql";
import logger from "$/src/logger";

// eslint-disable-next-line
export const getTask: Extract<QueryResolvers["getTask"], Function> = async (
  _,
  { taskId },
  context
) => {
  if (!context.user || !context.user.id) {
    logger.info("unauthenticated task accessing attempt");
    return null;
  }
  const userId = context.user.id;
  const childLogger = logger.child({
    taskId,
    userId,
  });

  if (!taskId) {
    childLogger.info("invalid task id");
    return null;
  }

  const task = await context.dataSources.tasks.getTask(taskId);

  if (!task || task.userId !== context.user.id) {
    childLogger.info("unauthorized task read: wrong user");
    return null;
  }

  return task;
};

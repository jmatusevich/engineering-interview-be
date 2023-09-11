import { MutationResolvers } from "$/src/generated/graphql";
import logger from "$/src/logger";
export const updateTask: Extract<
  MutationResolvers["updateTask"],
  Function // eslint-disable-line
> = async (_, { taskId, input }, context) => {
  if (!context.user || !context.user.id) {
    logger.info("unauthenticated task creation attempt");
    return null;
  }
  const userId = context.user.id;
  const childLogger = logger.child({
    taskId,
    input,
    userId,
  });
  if (!input) {
    childLogger.info("update with no input");
    return null;
  }
  if (!taskId) {
    childLogger.info("update with no task");
    return null;
  }

  let task = await context.dataSources.tasks.getTask(taskId);
  if (!task || task.userId !== context.user.id) {
    childLogger.info("unauthorized task update: wrong user");
    return null;
  }

  const { title, description, status } = input;
  task = await context.dataSources.tasks.updateTask(taskId, context.user.id, {
    title: title ?? undefined,
    description,
    status: status ?? undefined,
  });
  return task;
};

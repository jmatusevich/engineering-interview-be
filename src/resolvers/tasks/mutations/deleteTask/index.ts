import { MutationResolvers } from "$/src/generated/graphql";
import logger from "$/src/logger";
export const deleteTask: Extract<
  MutationResolvers["deleteTask"],
  Function // eslint-disable-line
> = async (_, { taskId }, context) => {
  if (!context.user || !context.user.id) {
    logger.info("unauthenticated task creation attempt", {
      taskId,
    });
    return false;
  }
  const userId = context.user.id;
  const childLogger = logger.child({
    taskId,
    userId,
  });
  if (!taskId) {
    childLogger.info("delete with no task", {
      userId: context.user.id,
    });
    return false;
  }
  const task = await context.dataSources.tasks.getTask(taskId);
  if (!task || task.userId !== context.user.id) {
    childLogger.info("unauthorized task deletion: wrong user", {
      userId: context.user.id,
      taskId,
    });
    return false;
  }

  try {
    childLogger.info("removing task");
    const alteredRows = await context.dataSources.tasks.deleteTask(
      taskId,
      context.user.id
    );
    childLogger.info("removed task");
    return alteredRows === 1;
  } catch (error) {
    childLogger.error((error as Error)?.message);
    return false;
  }
};

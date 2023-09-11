import { MutationResolvers, TaskStatus } from "$/src/generated/graphql";
import logger from "$/src/logger";
export const createTask: Extract<
  MutationResolvers["createTask"],
  Function // eslint-disable-line
> = async (_, { input }, context) => {
  if (!context.user || !context.user.id) {
    logger.info("unauthenticated task creation attempt");
    return null;
  }
  const userId = context.user.id;
  const childLogger = logger.child({
    input,
    userId,
  });
  if (!input) {
    childLogger.info("create with no input");
    return null;
  }

  const { title, description, status } = input;
  const task = await context.dataSources.tasks.createTask({
    title,
    description: description ?? undefined,
    status: status ?? TaskStatus.ToDo,
    userId,
  });
  return task;
};

import { QueryResolvers } from "$/src/generated/graphql";
import logger from "$/src/logger";

export const getCurrentUser: Extract<
  QueryResolvers["getCurrentUser"],
  Function // eslint-disable-line
> = async (_, __, context) => {
  if (!context.user || !context.user.id) {
    logger.info("Unauthenticated user tried to get current user");
    return null;
  }
  return context.user;
};

import { QueryResolvers } from "$/src/generated/graphql";
import logger from "$/src/logger";

// eslint-disable-next-line
export const getJWT: Extract<QueryResolvers["getJWT"], Function> = async (
  _,
  { username, password },
  context
) => {
  const childLogger = logger.child({
    username,
  });
  if (!username || !password) {
    childLogger.info("Missing credentials for jwt retrieval");
    return null;
  }
  logger.info("user attempting to authenticate");
  const jwt = await context.dataSources.users.getJWT(username, password);

  if (!jwt) {
    logger.info("invalid credentials for jwt retrieval");
    return null;
  }
  return jwt;
};

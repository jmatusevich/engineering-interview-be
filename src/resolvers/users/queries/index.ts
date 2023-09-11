import { Resolvers } from "$/src/generated/graphql";
import { getCurrentUser } from "./getCurrentUser";
import { getJWT } from "./getJWT";

type UserQueries = Resolvers["Query"];
const resolvers: UserQueries = {
  getJWT,
  getCurrentUser,
};
export default resolvers;

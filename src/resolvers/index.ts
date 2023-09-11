import { Resolvers } from "$/src/generated/graphql";
import usersResolver from "./users";
import tasksResolver from "./tasks";

const resolvers: Resolvers = {
  Query: {
    ...usersResolver.Query,
    ...tasksResolver.Query,
  },
  Mutation: {
    ...usersResolver.Mutation,
    ...tasksResolver.Mutation,
  },
};
export default resolvers;

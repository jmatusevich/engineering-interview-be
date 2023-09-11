import { Resolvers } from "$/src/generated/graphql";
import mutations from "./mutations";
import queries from "./queries";

const resolvers: Resolvers = {
  Query: {
    ...queries,
  },
  Mutation: {
    ...mutations,
  },
};
export default resolvers;

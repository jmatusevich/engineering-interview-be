import { Resolvers } from "$/src/generated/graphql";
import { createUser } from "./createUser";
import { deleteUser } from "./deleteUser";
import { updateUser } from "./updateUser";

type UserMutations = Resolvers["Mutation"];
const resolvers: UserMutations = {
  createUser,
  updateUser,
  deleteUser,
};
export default resolvers;

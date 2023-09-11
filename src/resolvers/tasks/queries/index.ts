import { Resolvers } from "$/src/generated/graphql";
import { getStatusGroupedTasks } from "./getStatusGroupedTasks";
import { getTask } from "./getTask";
import { getTasks } from "./getTasks";

type TaskQueries = Resolvers["Query"];
const resolvers: TaskQueries = {
  getTask,
  getStatusGroupedTasks,
  getTasks,
};
export default resolvers;

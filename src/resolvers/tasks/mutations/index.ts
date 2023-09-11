import { Resolvers } from "$/src/generated/graphql";
import { batchUpdateTasksStatuses } from "./batchUpdateTasksStatuses";
import { createTask } from "./createTask";
import { deleteTask } from "./deleteTask";
import { moveTaskToPosition } from "./moveTaskToPosition";
import { swapTasks } from "./swapTasks";
import { updateTask } from "./updateTask";
type TaskMutations = Resolvers["Mutation"];
const resolvers: TaskMutations = {
  createTask,
  deleteTask,
  updateTask,
  swapTasks,
  moveTaskToPosition,
  batchUpdateTasksStatuses,
};
export default resolvers;

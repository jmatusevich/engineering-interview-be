import { Task } from "$/src/types/Task";
import { TaskStatus } from "$/src/generated/graphql";

const aDate = "2022-09-10";
export const MOCKED_TASKS: Task[] = [
  {
    id: 1,
    title: "Some Task",
    createdAt: aDate,
    updatedAt: aDate,
    userId: 1,
    order: 0,
    status: TaskStatus.Done,
  },
  {
    id: 2,
    title: "Other",
    createdAt: aDate,
    updatedAt: aDate,
    userId: 1,
    order: 1,
    status: TaskStatus.Done,
  },
  {
    id: 3,
    title: "Third",
    createdAt: aDate,
    updatedAt: aDate,
    userId: 1,
    order: 2,
    status: TaskStatus.Archived,
  },
  {
    id: 4,
    title: "Fourth",
    createdAt: aDate,
    updatedAt: aDate,
    userId: 1,
    order: 3,
    status: TaskStatus.InProgress,
  },
  {
    id: 5,
    title: "Fifth",
    createdAt: aDate,
    updatedAt: aDate,
    userId: 1,
    order: 4,
    status: TaskStatus.Done,
  },
];

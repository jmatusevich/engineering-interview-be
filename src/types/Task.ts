import { TaskStatus } from "$/src/generated/graphql";

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  status: TaskStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ValidTaskSortKeyType =
  | "order"
  | "updatedAt"
  | "createdAt"
  | "title"
  | "status";

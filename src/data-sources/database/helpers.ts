import { Knex } from "knex";
import { GroupedTasks, SortEnum, TaskStatus } from "$/src/generated/graphql";
import { ValidTaskSortKeyType, Task } from "$/src/types/Task";

export function isValidInt(id?: number | null) {
  return id !== undefined && id !== null && Number.isInteger(id);
}

export function isValidString(
  someString?: string | null,
  mininmumLength?: number
) {
  return (
    someString !== null &&
    someString !== undefined &&
    someString.length >= (mininmumLength ?? 1)
  );
}

export function isValidStatus(status: string) {
  const validValues = Object.values(TaskStatus);
  return validValues.findIndex((aStatus) => aStatus === status) !== -1;
}

export function singleItemResponse<T>(items: T[]) {
  if (!items.length) {
    return null;
  }
  return items[0];
}

export function multiItemResponse<T>(items: T[]) {
  return items;
}

export function optionalMultiItemResponse<T>(items?: T[]) {
  return items ?? null;
}

export function nextTaskPositionForUserIdSubQuery(knex: Knex, userId: number) {
  if (!isValidInt(userId)) {
    throw new Error("InvalidId");
  }
  return knex.raw(
    `(SELECT coalesce(MAX("order") + 1, 0) as order from tasks where "userId" = :userId)`,
    {
      userId,
    }
  );
}

export function reduceTasksToGroupsByStatus(tasks: Task[]): GroupedTasks {
  return tasks.reduce(
    (partialValue, currentTask) => {
      return {
        ...partialValue,
        [currentTask.status]: [
          ...partialValue[currentTask.status],
          currentTask,
        ],
      };
    },
    {
      ARCHIVED: [],
      DONE: [],
      IN_PROGRESS: [],
      TO_DO: [],
    }
  );
}

export function mapSortEnumToKey(enumValue: SortEnum): ValidTaskSortKeyType {
  switch (enumValue) {
    case SortEnum.CreatedAt:
      return "createdAt";
    case SortEnum.Order:
      return "order";
    case SortEnum.Status:
      return "status";
    case SortEnum.Title:
      return "title";
    case SortEnum.UpdatedAt:
      return "updatedAt";
    default:
      throw new Error("InvalidSortKey");
  }
}

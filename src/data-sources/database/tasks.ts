import { SQLDataSource } from "datasource-sql";
import {
  isValidInt,
  isValidString,
  isValidStatus,
  singleItemResponse,
  nextTaskPositionForUserIdSubQuery,
  multiItemResponse,
  optionalMultiItemResponse,
  mapSortEnumToKey,
  reduceTasksToGroupsByStatus,
} from "./helpers";

import { TaskStatus, SortEnum } from "$/src/generated/graphql";
import { Task, ValidTaskSortKeyType } from "$/src/types/Task";
import logger from "$/src/logger";

const DEFAULT_SORT_KEYS: ValidTaskSortKeyType[] = [
  "order",
  "createdAt",
  "title",
];

class TasksDataSource extends SQLDataSource {
  getTasksForUserId(
    userId: number,
    sortedBy?: SortEnum[],
    filteredByStatuses?: TaskStatus[]
  ) {
    if (!isValidInt(userId)) {
      throw new Error("InvalidUserId");
    }
    let sortKeys: ValidTaskSortKeyType[] = DEFAULT_SORT_KEYS;
    if (!!sortedBy && sortedBy.length !== 0) {
      sortKeys = sortedBy.map(mapSortEnumToKey);
    }
    if (
      !!filteredByStatuses &&
      (filteredByStatuses.length === 0 ||
        filteredByStatuses.some((aStatus) => !isValidStatus(aStatus)))
    ) {
      throw new Error("FilteringByInexistentStatus");
    }

    const query = this.knex.select("*").from("tasks").where("userId", userId);
    if (filteredByStatuses) {
      query.and.whereIn("status", filteredByStatuses);
    }

    query.orderBy(sortKeys);

    return query.then(multiItemResponse<Task>);
  }

  async getStatusGroupedTasksForUserId(
    userId: number,
    sortedBy?: SortEnum[],
    filteredByStatuses?: TaskStatus[]
  ) {
    const tasks = await this.getTasksForUserId(
      userId,
      sortedBy,
      filteredByStatuses
    );

    return reduceTasksToGroupsByStatus(tasks);
  }

  getTask(id: number) {
    if (!isValidInt(id)) {
      throw new Error("InvalidTaskId");
    }
    return this.knex
      .select("*")
      .from("tasks")
      .where("id", id)
      .then(singleItemResponse<Task>);
  }

  moveTaskToPosition(taskId: number, order: number, userId: number) {
    if (!isValidInt(taskId)) {
      throw new Error("InvallidTaskId");
    }
    if (!isValidInt(userId)) {
      throw new Error("InvallidUserId");
    }
    if (!isValidInt(order)) {
      throw new Error("InvallidNewPosition");
    }
    return this.knex
      .transaction(async (transaction) => {
        const partialTask = await transaction
          .select("order")
          .from("tasks")
          .where("id", taskId)
          .andWhere("userId", userId)
          .then(singleItemResponse<Pick<Task, "order">>);
        if (!partialTask) {
          transaction.rollback(new Error("InvallidTaskId"));
        } else {
          const { order: previousOrder } = partialTask;
          if (!isValidInt(previousOrder)) {
            transaction.rollback(new Error("InvallidOldPosition"));
          }
          if (order === previousOrder) {
            transaction.rollback(new Error("ErrorSwappingTaskWithItself"));
          } else {
            return await transaction
              .update({
                updatedAt: transaction.raw("DEFAULT"),
                order: this.knex.raw(
                  `
                  case id
                    WHEN :taskId then :order
                  else "order" + 1
                  end
                  `,
                  {
                    taskId,
                    order,
                  }
                ),
              })
              .from("tasks")
              .where("userId", userId)
              .andWhere("order", ">=", order)
              .andWhere("order", "<=", previousOrder)
              .returning(["*"])
              .then(transaction.commit)
              .catch((error) => {
                logger.warn(error);
                return transaction.rollback(error);
              });
          }
        }
      })
      .then(optionalMultiItemResponse<Task>);
  }

  swapTasksOrder(aTaskId: number, bTaskId: number, userId: number) {
    if (!isValidInt(aTaskId) || !isValidInt(bTaskId)) {
      throw new Error("InvallidTaskId");
    }
    if (!isValidInt(userId)) {
      throw new Error("InvallidUserId");
    }
    if (aTaskId === bTaskId) {
      throw new Error("ErrorSwappingTaskWithItself");
    }

    return this.knex
      .update({
        updatedAt: this.knex.raw("DEFAULT"),
        order: this.knex.raw(
          `
          case id
              WHEN :aTaskId then (SELECT "order" FROM tasks WHERE id = :bTaskId)
              WHEN :bTaskId then (SELECT "order" FROM tasks WHERE id = :aTaskId)
          end
          `,
          {
            aTaskId,
            bTaskId,
          }
        ),
      })
      .from("tasks")
      .whereRaw(
        `(SELECT count(id) FROM tasks WHERE "userId" = :userId AND id = :aTaskId) = 1`,
        {
          userId,
          aTaskId,
        }
      )
      .andWhereRaw(
        `(SELECT count(id) FROM tasks WHERE "userId" = :userId AND id = :bTaskId) = 1`,
        {
          userId,
          bTaskId,
        }
      )
      .and.whereIn("id", [aTaskId, bTaskId])
      .andWhere("userId", userId)
      .returning(["*"])
      .then(multiItemResponse<Task>);
  }

  async updateTasksStatuses(ids: number[], status: TaskStatus, userId: number) {
    if (ids.some((anId) => !isValidInt(anId))) {
      throw new Error("InvalidIds");
    }
    if (!isValidStatus(status)) {
      throw new Error("InvalidStatus");
    }
    if (!isValidInt(userId)) {
      throw new Error("InvalidUserId");
    }
    const tasks = await this.knex
      .select(["id", "userId"])
      .from("tasks")
      .whereIn("id", ids)
      .then(multiItemResponse<Pick<Task, "id" | "userId">>);

    if (tasks.some((aTask) => aTask.userId !== userId)) {
      throw new Error("UnauthorizedTaskStatusesUpdate");
    }
    if (tasks.length !== ids.length) {
      throw new Error("BatchStatusUpdatedErrorSomeTasksDontExist");
    }
    return this.knex
      .update({
        status,
        updatedAt: this.knex.raw("DEFAULT"),
      })
      .from("tasks")
      .whereIn("id", ids)
      .andWhere("userId", userId)
      .returning(["*"])
      .then(multiItemResponse<Task>);
  }

  updateTask(
    id: number,
    userId: number,
    {
      title,
      description,
      status,
    }: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
    }
  ) {
    if (!isValidInt(id)) {
      throw new Error("InvalidId");
    }
    if (!isValidInt(userId)) {
      throw new Error("InvalidUserId");
    }
    if (!!title && !isValidString(title, 3)) {
      throw new Error("InvalidTitle");
    }
    if (!!status && !isValidStatus(status)) {
      throw new Error("InvalidStatus");
    }

    return this.knex
      .update({
        title,
        description,
        status,
        updatedAt: this.knex.raw("DEFAULT"),
      })
      .where("id", id)
      .from("tasks")
      .andWhere("userId", userId)
      .returning("*")
      .then(singleItemResponse<Task>);
  }

  createTask({
    title,
    description,
    status,
    userId,
  }: {
    title: string;
    description?: string;
    status: TaskStatus;
    userId: number;
  }) {
    if (!isValidInt(userId)) {
      throw new Error("InvalidUserId");
    }
    if (!isValidString(title, 3)) {
      throw new Error("InvalidTitle");
    }
    if (!isValidStatus(status)) {
      throw new Error("InvalidStatus");
    }
    return this.knex
      .insert(
        {
          title,
          description,
          status,
          userId,
          order: nextTaskPositionForUserIdSubQuery(this.knex, userId),
        },
        ["*"]
      )
      .into("tasks")
      .then(singleItemResponse<Task>);
  }
  deleteTask(id: number, userId: number) {
    if (!isValidInt(id) || !isValidInt(userId)) {
      throw new Error("MissingFields");
    }
    return this.knex
      .from("tasks")
      .where("id", id)
      .andWhere("userId", userId)
      .del();
  }
}

export default TasksDataSource;

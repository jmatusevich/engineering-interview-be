import { Config } from "apollo-server";
import { ExpressContext } from "apollo-server-express";

import UsersDataSource from "$/src/data-sources/database/users";
import TasksDataSource from "$/src/data-sources/database/tasks";

import { User } from "./User";

export type Context = {
  dataSources: {
    users: UsersDataSource;
    tasks: TasksDataSource;
  };
  user?: User;
};

export type ContextFunction = Config<ExpressContext>["context"];

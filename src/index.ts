import { ApolloServer } from "apollo-server";
import { readFileSync } from "fs";
import knex from "knex";
import resolvers from "./resolvers";

import knexConfig from "./database/knexfile";
import logger from "./logger";

import UsersDataSource from "./data-sources/database/users";
import TasksDataSource from "./data-sources/database/tasks";
import { contextFunctionForUsersDataSource } from "./helpers/context";

const typeDefs = readFileSync("./schema.graphql", { encoding: "utf-8" });

const knexInstance = knex(knexConfig.development);
const users = new UsersDataSource(knexInstance);
const tasks = new TasksDataSource(knexInstance);
export const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    users,
    tasks,
  }),
  context: contextFunctionForUsersDataSource(users),
});

const port = process.env.PORT ?? 3000;

server.listen({ port }).then(({ url }) => {
  logger.info(`GraphQL sever available at ${url}`);
});

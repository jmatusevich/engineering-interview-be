import type { Knex } from "knex";
import path from "path";
import dotenv from "dotenv";
dotenv.config({
  path: path.join(process.env.PWD ?? "", ".env"),
});
// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      host: process.env.POSTGRES_HOST ?? "localhost",
      database: process.env.POSTGRES_DATABASE ?? "postgres",
      user: process.env.POSTGRES_USER ?? "postgres",
      port: parseInt(process.env.POSTGRES_PORT ?? "5432", 10),
      password: process.env.POSTGRES_PASSWORD ?? "postgres",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};

export default config;

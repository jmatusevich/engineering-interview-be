import { Knex } from "knex";
import { TaskStatus } from "$/src/generated/graphql";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("tasks", function (table) {
    table.increments();
    table.string("title").notNullable();
    table.string("description").nullable();
    table
      .enum("status", [
        TaskStatus.ToDo,
        TaskStatus.InProgress,
        TaskStatus.Done,
        TaskStatus.Archived,
      ])
      .notNullable()
      .defaultTo("TODO");
    table.smallint("order").notNullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.integer("userId").unsigned().notNullable();
    table
      .foreign("userId")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.unique(["userId", "order"], {
      deferrable: "deferred",
      useConstraint: true,
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("tasks");
}

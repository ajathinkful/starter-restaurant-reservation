// src/db/migrations/20231204120000_createTablesTable.js

exports.up = function (knex) {
  return knex.schema.createTable("tables", (table) => {
    table.increments("table_id").primary();
    table.string("table_name").notNullable();
    table.integer("capacity").notNullable();
    table.boolean("occupied").defaultTo(false);

    // Add reservation_id column with foreign key reference
    table
      .integer("reservation_id")
      .unsigned()
      .references("reservation_id")
      .inTable("reservations")
      .onDelete("SET NULL"); // Set to null if the referenced reservation is deleted
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tables");
};

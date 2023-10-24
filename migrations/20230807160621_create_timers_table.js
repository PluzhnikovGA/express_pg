/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("timers", (table) => {
    table.increments("id");
    table.integer("userId").notNullable();
    table.foreign("userId").references("users.id");
    table.bigint("start").notNullable();
    table.bigint("end");
    table.string("description").notNullable();
    table.boolean("isActive").defaultTo("true");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("timers");
};

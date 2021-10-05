
exports.up = function(knex) {
  return knex.schema.alterTable("tables", (table) => {
    table.string("status").alter().defaultTo("free");
    table.integer("reservation_id").unsigned();
    table
      .foreign("reservation_id")
      .references("reservation_id")
      .inTable("reservations")
      .onDelete("SET NULL");
    table.timeStamps(true, true);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable("tables");
};

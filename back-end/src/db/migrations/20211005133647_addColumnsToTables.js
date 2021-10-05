exports.up = function(knex) {
  return knex.schema.table("tables", (table) => {
    table.integer("reservation_id").unsigned();
    table
      .foreign("reservation_id")
      .references("reservation_id")
      .inTable("reservations")
      .onDelete("SET NULL");
    table.timestamps(true, true);
    knex.raw(
    'ALTER TABLE tables MODIFY COLUMN status string'
    );
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("tables");
};
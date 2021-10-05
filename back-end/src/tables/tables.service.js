const { del } = require("../db/connection");
const knex = require("../db/connection");

function list() {
  return knex("tables").returning("*");
}

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0])
}

function read(tableId) {
  return knex("tables")
    .returning("*")
    .where({ table_id: tableId })
}

function update(table_id, updatedTable) {
  return knex("tables")
    .select("*")
    .where({ table_id })
    .update(updatedTable)
}

function destroy(tableId) {
  return knex("tables")
    .where({ tableId })
    .del()
}

module.exports = {
  list,
  create,
  read,
  update,
  destroy
}
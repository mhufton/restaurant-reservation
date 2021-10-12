const { del } = require("../db/connection");
const knex = require("../db/connection");

function list() {
  return knex("tables").returning("*").orderBy("table_name");
}

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0])
}

function read(table_id) {
  return knex("tables")
    .returning("*")
    .where({ table_id: table_id })
    .then((createRecords) => createRecords[0])
}

function update(table_id, updatedTable) {
  return knex("tables")
    .select("*")
    .where({ table_id })
    .update(updatedTable)
}

function destroy(table_id) {
  return knex("tables")
    .where({ table_id: table_id })
    .del()
}

function seat(updatedTable) {
  return knex("tables")
    .select("*")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((result) => result[0])
};

function finish(updatedTable) {
  return knex("tables")
    .select("*")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((result) => result[0])
}

module.exports = {
  list,
  create,
  read,
  update,
  destroy,
  seat,
  finish
}
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

async function deleteSeatReservation(table_id, reservation_id) {
  const trx = await knex.transaction();
  let updatedTable = {};
  return trx("reservations")
    .where({ reservation_id })
    .update({ status: "finished" })
    .then(() =>
      trx("tables")
        .where({ table_id })
        .update({ reservation_id: null }, "*")
        .then((result) => (updatedTable = result[0]))
    )
    .then(trx.commit)
    .then(() => updatedTable)
    .catch(trx.rollback);
}

function seat(updatedTable) {
  return knex("tables")
    .select("*")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((result) => result[0])
};

function finish(updatedTable) {
  console.log("table service finish starting")
  return knex("tables")
      .select("*")
      .where({ table_id: updatedTable.table_id })
      .update(updatedTable, "*")
      .then((updatedTables) => updatedTables[0]);
}
module.exports = {
  list,
  create,
  read,
  update,
  deleteSeatReservation,
  destroy,
  seat,
  finish
}
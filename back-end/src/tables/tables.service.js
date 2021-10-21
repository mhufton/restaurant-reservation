const knex = require("../db/connection");

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((result) => result[0]);
}

// function read(table_id) {
//   return knex("tables as t")
//     .leftJoin("reservations as r", "r.reservation_id", "t.reservation_id")
//     .select(
//       "t.table_id",
//       "t.table_name",
//       "t.capacity",
//       "t.reservation_id",
//       "r.first_name",
//       "r.last_name",
//       "r.mobile_number",
//       "r.reservation_date",
//       "r.reservation_time",
//       "r.people",
//       "r.status",
//       "r.created_at as reservation_created",
//       "rd_at as reservation_updated"
//     )
//     .where({ table_id })
//     .then((result) => result[0]);
// }

function read(table_id) {
  return knex("tables")
    .select("*")
    .where({ table_id })
    .then((result) => result[0])
}

function readReservation(reservation_id) {
  return knex("reservations")
    .where({ reservation_id })
    .then((result) => result[0]);
}

function readTableByReservation(reservation_id) {
  return knex("tables")
    .where({ reservation_id })
    .whereExists(knex.select("*").from("tables").where({ reservation_id }))
    .then((result) => result[0]);
}

function seatReservation(updatedTable) {
  return knex("tables")
      .select("*")
      .where({ table_id: updatedTable.table_id })
      .update(updatedTable)
      .then((result) => result[0]);
}


async function deleteSeatReservation(table_id, reservation_id) {
  const trx = await knex.transaction();
  let updatedTable = {};
  return trx("reservations")
    .where({ reservation_id })
    ({ status: "finished" })
    .then(() =>
      trx("tables")
        .where({ table_id })
        ({ reservation_id: null }, "*")
        .then((result) => (updatedTable = result[0]))
    )
    .then(trx.commit)
    .then(() => updatedTable)
    .catch(trx.rollback);
}

function deleteTable(table_id) {
  return knex("tables").where({ table_id: table_id }).del();
}

function list() {
  return knex("tables").orderBy("table_name");
}

function finish(updatedTable) {
  return knex("tables")
      .select("*")
      .where({ table_id: updatedTable.table_id })
      (updatedTable, "*")
      .then((updatedTables) => updatedTables[0]);
}


module.exports = {
  create,
  read,
  readReservation,
  readTableByReservation,
  seatReservation,
  deleteSeatReservation,
  list,
  deleteTable,
  finish,
};
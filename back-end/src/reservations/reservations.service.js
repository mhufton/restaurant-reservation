const knex = require("../db/connection");

function list() {
  return knex("reservations").select("*")
};

function create(reservation) {
  return knex('reservations')
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0])
}

function read(reservationId) {
  return knex("reservations")
  .select("*")
  .where({ reservation_id: reservationId })
}

function update(reservation_id, updatedRes) {
  return knex('reservations')
    .select("*")
    .where({ reservation_id })
    .update(updatedRes)
}

function destroy(reservationId) {
  return knex("reservations").where({ reservation_id: reservationId }).del();
}

function listByDate(reservation_date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date })
}

module.exports = {
  list,
  listByDate,
  create,
  read,
  update,
  destroy,
}
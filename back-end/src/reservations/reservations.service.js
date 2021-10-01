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

function update(updatedReservation) {
  return knex('reservations')
    .select("*")
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation, "*")
    .then((updatedRecords) => updatedRecords[0])
}

function destroy(reservationId) {
  return knex("reservations").where({ reservation_id: reservationId }).del();
}

function listReservationsByDate(reservation_date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date })
}

module.exports = {
  list,
  listReservationsByDate,
  create,
  read,
  update,
  destroy,
}
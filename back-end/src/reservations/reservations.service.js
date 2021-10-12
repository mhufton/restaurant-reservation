const knex = require("../db/connection");

function list() {
  return knex("reservations").select("*")
};

function listByPhone(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0])
}

function read(reservation_id) {
  return knex("reservations")
  .select("*")
  .where({ reservation_id: reservation_id })
  .then((createdRecords) => createdRecords[0])
}

function update(reservation_id, updatedRes) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: reservation_id })
    .update(updatedRes)
    .then((createdRecords) => createdRecords[0])
}

function destroy(reservation_id) {
  return knex("reservations").where({ reservation_id: reservation_id }).del();
}

function listByDate(reservation_date) {
  reservation_date = new Date(reservation_date).toJSON().substring(0, 10);
  return knex("reservations")
    .select("*")
    .where({ reservation_date })
    .whereNot({ status: "finished" })
    .whereNot({ status: "cancelled" })
    .orderBy("reservation_time");
}

module.exports = {
  list,
  listByDate,
  listByPhone,
  create,
  read,
  update,
  destroy,
}
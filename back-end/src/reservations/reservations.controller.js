const service = require("./reservations.service");
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  const reservation = await service.read(reservationId);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  return next({
    status: 404,
    message: `Reservation could not be found.`
  })
}

async function hasProps(req, res, next) {
  const {
    firstName,
    lastName,
    mobile_number,
    reservation_date,
    reservation_time,
    peopleInParty,
  } = req.body.data;
}

async function list(req, res) {
  res.json({ data: await service.list() })
}

async function listByDate(req, res, next) {
  res.json({ data: await service(listReservationsByDate) })
}

async function read(req, res, next) {
  const { reservation } = res.locals;
  if (reservation) {
    const data = await service.read(reservation.resrevation.id)
    res.status(201).json({ data })
  }
}

async function create(req, res, next) {
  const data = await service.create(req.body.data);
  console.log("creating")
  res.status(201).json({ data })
}

async function update(req, res, next) {
  const updatedReservation = {
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id
  }
  const data = await service.update(updatedReservation);
  res.status(201).json({ data })
}

async function destroy(req, res) {
  const { reservation } = res.locals;
  await service.destroy(reservation.reservation_id);
  res.sendStatus(204);
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [hasProps, asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  update: [hasProps, asyncErrorBoundary(reservationExists), asyncErrorBoundary(update)],
  delete: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(destroy)],
};

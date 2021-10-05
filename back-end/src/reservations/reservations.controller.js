const service = require("./reservations.service");
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

// middleware
async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  const foundRes = await service.read(reservationId);
  if (foundRes) {
    res.locals.reservation = foundRes;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservationId} cannot be found`
  })
}

async function hasProps(req, res, next) {
  const {
    data: {
      first_name,
      last_name,
      mobile_number,
      reservation_date,
      reservation_time,
      people,
    } = {},
  } = req.body;
  let message = "";
  if (!first_name) {
    message = "CONTROLLER: Reservation must include a first name"
  }
  if (!last_name) {
    message = "CONTROLLER: Reservation must include a last name"
  }
  if (!mobile_number) {
    message = "CONTROLLER: Reservation must include a mobile number"
  }
  if (!reservation_date) {
    message = "CONTROLLER: Resevation must include a date"
  }
  if (!reservation_time) {
    message = "CONTROLLER: Reservation must include a time"
  }
  // if (people === 0 || !people || !Number.isInteger(people)) {
  //   message = "CONTROLLER: Reservation must include a number that is greater than 0"
  // }
  if (message.length) {
    next({
      status: 400,
      message: message
    })
  }
  res.locals.body = req.body.data;
  return next();
}

// CRUDL

// async function list(req, res) {
//   const { date } = req.query;
//   if (date) {
//     const data = await service.listByDate(date);
//     res.json({ data })
//   } else {
//     const data = await service.list();
//     res.json({ data })
//   }
// };

async function list(req, res) {
  res.json({ data: await service.list() })
}

async function create(req, res) {
  const reservation = req.body.data;
  const data = await service.create(reservation)
  res.status(201).json({ data })
}

async function read(req, res) {
  res.json({ data: res.locals.reservation })
}

async function update(req, res) {
  const reservation_id = res.locals.reservation[0].reservation_id;
  const updatedRes = req.body;
  await service.update(reservation_id, updatedRes);
  res.json({ data: updatedRes })
}

async function destroy(req, res) {
  const reservation_id = res.locals.reservation[0].reservation_id;
  await service.destroy(reservation_id);
  res.sendStatus(204);
}

module.exports = {
  list,
  create,
  read: [reservationExists, read],
  update: [reservationExists, update],
  destroy: [reservationExists, destroy]
}
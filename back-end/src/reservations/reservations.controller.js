const service = require("./reservations.service");
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

// middleware
async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const foundRes = await service.read(reservation_id);
  if (foundRes) {
    res.locals.reservation = foundRes;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservation_id} cannot be found`
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
  const newRes = new Date(`${reservation_date} PDT`)
    .setHours(reservation_time
    .substring(0, 2), reservation_time.substring(3));
  const now = Date.now();
  const weekday = new Date(reservation_date).getUTCDay();
  let message = "";
  if (!first_name) {
    message = "reservation must include a first_name"
  }
  if (!last_name) {
    message = "reservation must include a last_name"
  }
  if (!mobile_number) {
    message = "reservation must include a mobile_number"
  }
  if (!reservation_date) {
    message = "resevation_date must include a date"
  }
  if (!reservation_time) {
    message = "reservation_time must include a time"
  }
  if (newRes < now) {
    message = "reservation_time must be in the future."
  }
  if (weekday === 2) {
    message = "reservation_date cannot be on a Tuesday."
  }
  if (message.length > 0) {
    next({
      status: 400,
      message: message
    })
  }
  res.locals.body = req.body.data;
  return next();
}

function hasValidPeople(req, res, next) {
  const people = req.body.data.people;
  const valid = Number.isInteger(people);
  if (valid && people > 0) {
    return next();
  }
  next({
    status: 400,
    message: `people '${people}' is not a valid integer`,
  });
}

// CRUDL

async function list(req, res) {
  const { date, viewDate, mobile_number } = req.query;
  if (date) {
    const data = await service.listByDate(date);
    res.json({ data });
  } else if (viewDate) {
    const data = await service.listByDate(viewDate);
    res.json({ data });
  } else if (mobile_number) {
    const data = await service.listByPhone(mobile_number);
    res.json({ data });
  } else {
    const data = await service.list();
    res.json({ data });
  }
}


async function create(req, res) {
  const reservation = req.body.data;
  const data = await service.create(reservation)
  res.status(201).json({ data })
}

async function read(req, res) {
  const data = res.locals.reservation;
  res.json({ data })
}

async function update(req, res) {
  const reservation_id = res.locals.reservation.reservation_id;
  const updatedRes = req.body;
  await service.update(reservation_id, updatedRes);
  res.json({ data: updatedRes })
}

async function destroy(req, res) {
  const reservation_id = res.locals.reservation.reservation_id;
  await service.destroy(reservation_id);
  res.sendStatus(204);
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasProps,
    hasValidPeople,
    asyncErrorBoundary(create)
  ],
  read: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(read)
  ],
  update: [
    asyncErrorBoundary(reservationExists),
    hasProps,
    hasValidPeople,
    asyncErrorBoundary(update)],
  destroy: [
    asyncErrorBoundary(reservationExists),
    destroy]
}
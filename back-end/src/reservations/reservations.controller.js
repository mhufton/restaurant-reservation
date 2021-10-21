const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const onlyValidProperties = require("../errors/onlyValidProperties");

// SET UP FOR VALIDATION
const REQUIRED_PROPERTIES = [
  "first_name",
  "last_name",
  "people",
  "mobile_number",
  "reservation_date",
  "reservation_time",
];
const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "people",
  "status",
  "mobile_number",
  "reservation_date",
  "reservation_time",
];
const UPDATE_REQUIRED_PROPERTIES = [
  "first_name",
  "last_name",
  "people",
  "mobile_number",
  "reservation_date",
  "reservation_time",
];
const UPDATE_VALID_PROPERTIES = [
  "reservation_id",
  "status",
  "created_at",
  "updated_at",
  "first_name",
  "last_name",
  "people",
  "mobile_number",
  "reservation_date",
  "reservation_time",
];

const hasOnlyValidProperties = onlyValidProperties(VALID_PROPERTIES);
const hasRequiredProperties = hasProperties(REQUIRED_PROPERTIES);
const hasOnlyValidUpdateProperties = onlyValidProperties(
  UPDATE_VALID_PROPERTIES
);
const hasRequiredUpdateProperties = hasProperties(UPDATE_REQUIRED_PROPERTIES);
const hasOnlyStatus = onlyValidProperties(["status"]);
const hasRequiredStatus = hasProperties(["status"]);

// MIDDLEWARE FUNCTIONS
async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `reservation_id ${reservation_id} cannot be found.`,
  });
}

function hasValidDate(req, res, next) {
  const date = req.body.data.reservation_date;
  const valid = Date.parse(date);
  if (valid) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_date '${date}' is not a date.`,
  });
}

function hasValidTime(req, res, next) {
  const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  const time = req.body.data.reservation_time;
  const valid = time.match(regex);
  if (valid) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_time '${time}' is not a time.`,
  });
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

function hasValidStatus(req, res, next) {
  const { status } = req.body.data;
  if (
    status === "booked" ||
    status === "seated" ||
    status === "finished" ||
    status === "cancelled"
  ) {
    return next();
  }
  next({
    status: 400,
    message: `status '${status}' should be: 'booked', 'seated', or 'finished'.`,
  });
}

function statusIsBooked(req, res, next) {
  const { status } = res.locals.reservation;
  if (status === "booked") {
    return next();
  }
  next({
    status: 400,
    message: `status should be "booked", received '${status}'.`,
  });
}

function statusIsBookedIfPresent(req, res, next) {
  const { status } = req.body.data;
  if (!status || status === "booked") {
    return next();
  }
  next({
    status: 400,
    message: `status should be "booked" or absent, received '${status}'`,
  });
}

function statusIsNotFinished(req, res, next) {
  const { status } = res.locals.reservation;
  if (status === "finished") {
    return next({
      status: 400,
      message: `Cannot update a reservation where status is already 'finished'.`,
    });
  }
  next();
}

function noReservationsOnTuesdays(req, res, next) {
  const reservation_date = req.body.data.reservation_date;
  const weekday = new Date(reservation_date).getUTCDay();
  if (weekday !== 2) {
    return next();
  }
  next({
    status: 400,
    message: `The restaurant is closed on Tuesdays.`,
  });
}

function noReservationsInPast(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const presentDate = Date.now();
  const newReservationDate = new Date(
    `${reservation_date} ${reservation_time}`
  ).valueOf();
  if (newReservationDate > presentDate) {
    return next();
  }
  next({
    status: 400,
    message: `New reservations must be in the future.`,
  });
}

function reservationIsDuringBusinessHours(req, res, next) {
  const reservation_time = req.body.data.reservation_time;
  const hours = Number(reservation_time.slice(0, 2));
  const minutes = Number(reservation_time.slice(3, 5));
  const clockTime = hours * 100 + minutes;
  if (clockTime < 1030 || clockTime > 2130) {
    next({
      status: 400,
      message: `Reservation time '${reservation_time}' must be between 10:30 AM and 9:30 PM`,
    });
  }
  next();
}

// CRUD FUNCTIONS
async function create(req, res) {
  const newReservation = { 
    ...req.body.data,
    status: "booked",
  };
  const data = await service.create(newReservation);
  res.status(201).json({ data });
}

function read(req, res) {
  const data = res.locals.reservation;
  res.json({ data });
}

// async function update(req, res) {
//   const updatedRes = req.body.data;
//   console.log("UPDATE: updatedReservation", updatedRes)
//   console.log("UPDATE: data from API", data)
//   const { reservation_id } = req.params;
//   console.log("UPDATE: reservation_id", reservation_id)
//   const data = await service.update(reservation_id, updatedRes);
//   res.status(201).json({ data });
// }

// async function updateReservation(req, res) {
//   console.log("UPDATE_RES: res.locals.reservation", res.locals.reservation)
//   const reservation = res.locals.reservation;
//   console.log("UPDATE_RES: reservation", reservation)
//   const { data } = req.body;
//   console.log("UPDATE_RES: data", data)
//   const updatedRes = {
//     ...res.locals.reservation,
//     ...data,
//   }
//   console.log("UPDATE_RES: updatedRes", updatedRes)
//   const updatedReservation = await service.update(updatedRes);
//   res.status(200).json({ data: updatedReservation });
// }

// async function updateStatus(req, res) {
//   const { reservation, status } = res.locals;
//   // const status = reservation.status;
//   console.log("UPDATE_STATUS: reservation", reservation, " status", status)
//   const updatedRes = {
//     ...reservation,
//     status: status,
//   }
//   const updatedReservation = await service.update(updatedRes);
//   res.status(200).json({ data: updatedReservation });
// }

// async function updateStatus(req, res) {
//   const { status } = req.body.data;
//   console.log("UPDATESTATUS: status", status, "req.body.data", req.body.data)
//   const { reservation_id } = req.params;
//   console.log("UPDATESTATUS: reservation_id", reservation_id, "req.params", req.params)
//   const data = await service.updateStatus(reservation_id, status);
//   res.status(200).json({ data });
// }

async function updateStatus(req, res) {
  const { reservation, status } = res.locals;
  console.log("UPDATE_STATUS: res.locals")
  const updatedReservationData = {
    ...reservation,
    status: status,
  }
  console.log("UPDATE_STATUS: updatedReservationData", updatedReservationData)
  const updatedReservation = await service.update(updatedReservationData);
  res.json({ data: updatedReservation });
}

async function updateReservation(req, res) {
  const { reservation } = res.locals;
  const { data } = req.body;
  const updatedReservationData = {
    ...reservation,
    ...data,
  }
  const updatedReservation = await service.update(updatedReservationData);
  res.json({ data: updatedReservation });
}

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

module.exports = {
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasValidDate,
    hasValidTime,
    hasValidPeople,
    statusIsBookedIfPresent,
    noReservationsOnTuesdays,
    noReservationsInPast,
    reservationIsDuringBusinessHours,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), read],
  update: [
    asyncErrorBoundary(reservationExists),
    hasOnlyValidUpdateProperties,
    hasRequiredUpdateProperties,
    hasValidDate,
    hasValidTime,
    hasValidPeople,
    statusIsBooked,
    noReservationsOnTuesdays,
    noReservationsInPast,
    reservationIsDuringBusinessHours,
    asyncErrorBoundary(updateReservation),
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    hasOnlyStatus,
    hasRequiredStatus,
    hasValidStatus,
    statusIsNotFinished,
    asyncErrorBoundary(updateStatus),
  ],
  list: asyncErrorBoundary(list),
};
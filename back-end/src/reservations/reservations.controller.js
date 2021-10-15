const service = require("./reservations.service");
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const specifiedTimeString = require("../utils/specifiedTimeString")

// middleware
async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const foundRes = await service.read(reservation_id);
  if (foundRes) {
    res.locals.reservation = foundRes;
    console.log("reservation exists...")
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
  console.log("people", people, typeof(Number(people)))
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
    message = "reservation_date must include a date"
  }
  if (!reservation_time) {
    message = "reservation_time must include a time"
  }
  if (Number(people) <= 0 || !people || !Number.isInteger(Number(people))) {
    message = "Reservation must have a number of people that is greater than 0."
  }
  if (reservation_time && !reservation_time.match(/\d\d:\d\d/)) {
    message = "The reservation_time must be an actual time";
  }
  if (message.length > 0) {
    next({
      status: 400,
      message: message
    })
  }
  res.locals.body = req.body.data;
  console.log("reservation has props", res.locals.body)
  return next();
}

function dateAndTimeValidation(req, res, next) {
  const { reservation_date, reservation_time } = res.locals.body;
  dateObject = new Date(reservation_date + "T" + reservation_time);
  const today = new Date();
  const [year, month, day] = [
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ];
  const todayObject = new Date(year, month, day);
  todayObject.setHours(0);
  
  const reservationTimeTruncated = reservation_time.match(/\d\d:\d\d/)[0];
  const timeNow = today.toTimeString().match(/\d\d:\d\d/)[0];

  let message = "";
  if (dateObject < today) {
    message = "reservation_date must be in the future."
  }
  if (dateObject.getDay() === 2) {
    message = "restaurant is closed on Tuesday."
  }
  if (
    reservationTimeTruncated < specifiedTimeString(10, 30) ||
    reservationTimeTruncated > specifiedTimeString(21, 30)
  ) {
    message = "reservation_time must be between 10:30AM and 9:30PM."
  }

  if (message.length) {
    next({
      status: 400,
      message: message,
    })
  }
  console.log("valid date and time")
  return next();
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

// async function update(req, res) {
//   const { reservation } = res.locals;
//   console.log("reservation", res.locals.body)
//   const { data } = req.body;
//   console.log("data", data)
//   const updatedReservationData = {
//     ...reservation,
//     ...data,
//   }
//   console.log("updateReservationData", updatedReservationData)
//   const updatedReservation = await service.update(updatedReservationData);
//   console.log("updatedReservation", updatedReservation)
//   res.json({ data: updatedReservation });
// }

async function update(req, res) {
  const updatedReservation = { ...req.body.data };
  console.log("updatedReservation", updatedReservation);
  const { reservation_id } = req.params;
  console.log("reservation_id", reservation_id)
  const data = await service.update(reservation_id, updatedReservation);
  res.status(200).json({ data });
}

async function updateStatus(req, res) {
  const { status } = req.body.data;
  const { reservation_id } = req.params;
  const data = await service.updateStatus(reservation_id, status);
  res.status(200).json({ data });
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
    dateAndTimeValidation,
    asyncErrorBoundary(create)
  ],
  read: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(read)
  ],
  update: [
    asyncErrorBoundary(reservationExists),
    // hasProps,
    // dateAndTimeValidation,
    asyncErrorBoundary(update)],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    // hasProps,
    // dateAndTimeValidation,
    asyncErrorBoundary(updateStatus)
  ],
  destroy: [
    asyncErrorBoundary(reservationExists),
    destroy],
}
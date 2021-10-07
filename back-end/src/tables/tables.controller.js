const service = require("./tables.service");
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const reservationService = require("../reservations/reservations.service")

const REQUIRED_PROPS = ["table_name", "capacity"];
const VALID_PROPS = ["table_name", "capacity", "reservation_id", "people"];

function hasProps(req, res, next) {
  const {
    table_name,
    capacity,
  } = req.body;
  let message = "";
  if (!table_name) {
    message = "Table must have a name"
  }
  if (table_name.length < 2) {
    message = "Table name must be at least 2 characters long."
  }
  if (!Number.isInteger(capacity)) {
    message = "Capacity must be a number"
  }
  if (message.length) {
    return next({
      status: 400,
      message: message,
    })
  }
  res.locals.body = req.body.data;
  return next();
}

// function tableNameLength(req, res, next) {
//   const { table_name } = req.body.data;
//   if (table_name.length > 1) {
//     return next();
//   } else {
//     return next({
//       status: 400,
//       message: "table name must be at least 2 characters in length."
//     })
//   }
// }

// function capacityIsNumber(req, res, next) {
//   const { capacity } = req.body.data;
//   if (!isNaN(capacity)) {
//     return next();
//   } 
//   return next({
//     status: 400,
//     messsage: `Capacity must be a number`
//   })
// }

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const data = await service.read(table_id);
  if (data) {
    res.locals.table = data;
    return next()
  }
  return next({
    status: 400,
    message: `Table does not exist: ${table_id}`
  })
}

function tableCapacity(req, res, next) {
  const { capacity } = res.locals.table;
  const { people } = res.locals.reservation;
  if (capacity >= poeple) {
    return next();
  }
  return next({
    status: 400,
    message: "People in the party exceed capacity of the table."
  })
}

function tableStatusFree(req, res, next) {
  const { status } = res.locals.table;
  if (status !== "Free") {
    return next()
  }
  return next({
    status: 400,
    message: "Table is currently occupied"
  })
}

function tableStatusOccupied(req, res, next) {
  const { status } = res.locals.table;
  if (status !== occupied) {
    return next()
  }
  return next({
    status: 400,
    message: "Table is not currently occupied"
  })
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const data = await reservationService.read(reservation_id);
  if (data && data.status !== "Seated") {
    res.locals.reservation = data;
    return next();
  } else if (data && data.status === "Seated") {
    return next({
      status: 400,
      message: `Reservation ${reservation_id} is already seated.`
    })
  }
  return next({
    status: 404,
    message: `Reservation ${reservation_id} cannot be found.`
  })
}

async function list(req, res) {
  res.json({ data: await service.list() })
}

async function create(req, res) {
  const table = await service.create(req.body.data);
  res.status(201).json({ data: table })
}

async function read(req, res) {
  const table = await service.read(res.locals.table[0].table_id);
  res.json({ data: table })
}

async function seat(req, res) {
  const { table } = res.locals;
  const { reservation_id } = res.locals.reservation;
  const { table_id } = req.params;
  const updatedTableData = {
    ...table,
    table_id: table_id,
    reservation_id: reservation_id,
    status: "Occupied",
  }
  const updatedTable = await service.seat(updatedTableData);
  const updatedReservation = {
    status: "Seated",
    reservation_id: reservation_id,
  }
  await reservationService.update(updatedReservation);
  res.json({ data: updatedTable })
};

async function finish(req, res) {
  const { table_id } = req.params;
  const { table } = res.locals;
  const updatedTableData = {
      ...table,
      status: "Free"
  }
  const updatedTable = await service.finish(updatedTableData);
  // set reservation status to "finished" using reservation id
  const updatedReservation = {
      status: "finished", 
      reservation_id: table.reservation_id,
  }
  await reservationService.update(updatedReservation); 
  res.json({ data: updatedTable });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [hasProps, asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  seat: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(reservationExists),
    tableCapacity,
    tableStatusFree,
    asyncErrorBoundary(seat)
  ],
  finish: [
    asyncErrorBoundary(tableExists),
    tableStatusOccupied,
    asyncErrorBoundary(finish)
  ]
}
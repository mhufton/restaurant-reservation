const service = require("./tables.service");
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const reservationService = require("../reservations/reservations.service")

function hasProps(req, res, next) {
  const {
    data: {
      table_name,
      capacity,
    } = {},
  } = req.body;
  let message = "";
  console.log("props", table_name, capacity)
  if (!table_name) {
    message = "Table must have a table_name"
  }
  if (table_name.length < 2 || table_name === undefined) {
    message = "Table name must be at least 2 characters long."
  }
  if (!capacity) {
    message = "Tables must include a capacity."
  }
  if (message.length) {
    return next({
      status: 400,
      message: message,
    })
  }
  console.log("Checking props validation....")
  res.locals.body = req.body.data;
  return next();
}

async function tableExists(req, res, next) {
  console.log('checking if the table exists')
  const { table_id } = req.params;
  console.log("table_id", table_id)
  const data = await service.read(table_id);
  console.log("Table exists code", data)
  if (data) {
    console.log("got data", data)
    res.locals.table = data;
    return next()
  }
  return next({
    status: 404,
    message: `Table does not exist: ${table_id}`
  })
}

function tableCapacity(req, res, next) {
  const { capacity } = res.locals.table;
  const { people } = res.locals.reservation;
  if (capacity >= people) {
    return next();
  }
  return next({
    status: 400,
    message: "People in the party exceed capacity of the table."
  })
}

function tableIsFree(req, res, next) {
  const { status } = res.locals.table;
  if (status.toLowerCase() === "free") {
    return next()
  }
  return next({
    status: 400,
    message: "Table is currently occupied."
  })
}

function tableIsOccupied(req, res, next) {
  const { status } = res.locals.table;
  if (status.toLowerCase() === "occupied") {
    console.log('table is occupied')
    return next()
  }
  return next({
    status: 400,
    message: "Table is currently free."
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

async function create(req, res) {
  const table = req.body.data;
  const data = await service.create(table);
  res.status(201).json({ data });
}

async function list(req, res) {
  res.json({ data: await service.list() })
}

async function read(req, res) {
  const table = await service.read(res.locals.table.table_id);
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
  console.log("updatedTable", updatedTable)
  const updatedReservation = await reservationService.update(reservation_id, {
    status: "Seated",
    reservation_id: reservation_id,
  });

  res.json({ data: {updatedTable, updatedReservation} })
};

async function finish(req, res) {
  const { table_id } = req.params;
  const { table } = res.locals;
  const updatedTableData = {
      ...table,
      status: "Free"
  }
  console.log("tables.controller finish")
  const updatedTable = await service.finish(updatedTableData);
  const updatedReservation = {
      status: "Finished", 
      reservation_id: table.reservation_id,
  }
  await reservationService.update(updatedReservation); 
  res.json({ data: updatedTable });
}

async function reservationAlreadySeated(req, res, next) {
  const { reservation_id } = req.body.data;
  const seated = await reservationService.read(reservation_id);
  if (!seated) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_id ${reservation_id} is already seated at ${seated.table_id}`
  })
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasProps,
    asyncErrorBoundary(create)
  ],
  read: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(read)
  ],
  seat: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(reservationExists),
    tableCapacity,
    tableIsFree,
    asyncErrorBoundary(reservationAlreadySeated),
    asyncErrorBoundary(seat)
  ],
  finish: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    asyncErrorBoundary(finish)
  ]
}
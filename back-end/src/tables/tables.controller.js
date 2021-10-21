const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const onlyValidProperties = require("../errors/onlyValidProperties");
const reservationService = require("../reservations/reservations.service")

// SET UP FOR VALIDATION
const REQUIRED_PROPERTIES = ["table_name", "capacity"];
const VALID_PROPERTIES = ["table_name", "capacity", "reservation_id", "people"];

const hasOnlyValidPropertiesForCreate = onlyValidProperties(VALID_PROPERTIES);
const hasRequiredPropertiesForCreate = hasProperties(REQUIRED_PROPERTIES);

const hasOnlyValidPropertiesToSeat = onlyValidProperties(["reservation_id"]);
const hasRequiredPropertiesToSeat = hasProperties(["reservation_id"]);

// MIDDLEWARE FUNCTIONS
function hasValidName(req, res, next) {
  const { table_name } = req.body.data;
  if (table_name.length >= 2) {
    return next();
  }
  next({
    status: 400,
    message: `table_name '${table_name}' must be at least 2 characters long.`,
  });
}

function hasValidCapacity(req, res, next) {
  const capacity = req.body.data.capacity;
  if (capacity > 0 && Number.isInteger(capacity)) {
    return next();
  }
  next({
    status: 400,
    message: `capacity '${capacity}' must be a whole number greater than 0.`,
  });
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  console.log("table_id", table_id, "req.params", req.params)
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `table_id '${table_id}' does not exist.`,
  });
}

function tableVacant(req, res, next) {
  const table = res.locals.table;
  if (!table.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `table_id '${table.table_id}' is occupied by reservation_id '${table.reservation_id}'.`,
  });
}

function tableNotVacant(req, res, next) {
  const table = res.locals.table;
  if (table.reservation_id) {
    res.sendStatus(200)
    return next();
  }
  next({
    status: 400,
    message: `table_id '${table.table_id}' is not occupied.`,
  });
}

async function reservationAlreadySeated(req, res, next) {
  const { reservation_id } = req.body.data;
  const seated = await service.readTableByReservation(reservation_id);
  if (!seated) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_id '${reservation_id}' is already seated at table_id '${seated.table_id}'.`,
  });
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const reservation = await service.readReservation(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `reservation ${reservation_id} does not exist.`,
  });
}

async function hasEnoughCapacity(req, res, next) {
  const { reservation, table } = res.locals;
  if (table.capacity >= reservation.people) {
    return next();
  }
  next({
    status: 400,
    message: `table capacity '${table.capacity}' is smaller than group size '${reservation.people}'.`,
  });
}

async function tablesExistsForDelete(req, res, next) {
  const {data: {table_id}} = req.body;
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 400,
    message: `table '${table_id}' cannot be found.`
  });
}

// CRUD FUNCTIONS
async function create(req, res) {
  const table = req.body.data;
  const data = await service.create(table);
  res.status(201).json({ data });
}

function read(req, res) {
  const data = res.locals.table;
  res.json({ data });
}

// async function updateSeatReservation(req, res) {
//   const { reservation_id } = req.body.data;
//   const status = {
//     ...req.body.data,
//     status: "seated"
//   }
//   const data = await service.updateSeatReservation(reservation_id, status);
//   res.json({ data });
// }

async function seatReservation(req, res) {
  const { table } = res.locals;
  const { reservation_id } = res.locals.reservation;
  const { table_id } = req.params;
  const updatedTableData = {
      ...table,
      table_id: table_id,
      reservation_id: reservation_id,
      status: "Occupied",
  }
  const updatedTable = await service.seatReservation(updatedTableData);
  // const updatedReservation = {
  //     status: "seated", 
  //     reservation_id: reservation_id,
  // }
  // await reservationService.update(updatedReservation);
  res.json({ data: updatedTable });
}

async function deleteSeatReservation(req, res) {
  const { table_id, reservation_id } = res.locals.table;
  const data = await service.deleteSeatReservation(table_id, reservation_id);
  res.status(200).json({ data });
}

async function list(req, res) {
  const data = await service.list();
  res.json({ data });
}

async function finishTable(req, res) {
  const { table_id } = req.params;
  const { table } = res.locals;
  const updatedTableData = {
      ...table,
      status: "Free"
  }
  const updatedTable = await service.finish(updatedTableData);
  res.status(200).json({ data: updatedTable });
}

module.exports = {
  create: [
    hasOnlyValidPropertiesForCreate,
    hasRequiredPropertiesForCreate,
    hasValidName,
    hasValidCapacity,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), read],
  seatReservation: [
    hasRequiredPropertiesToSeat,
    hasOnlyValidPropertiesToSeat,
    asyncErrorBoundary(tableExists),
    tableVacant,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(hasEnoughCapacity),
    asyncErrorBoundary(reservationAlreadySeated),
    asyncErrorBoundary(seatReservation),
  ],
  deleteSeatReservation: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(tableNotVacant),
    asyncErrorBoundary(deleteSeatReservation),
  ],
  list: asyncErrorBoundary(list),
  // deleteTable: [
  //   asyncErrorBoundary(tablesExistsForDelete),
  //   asyncErrorBoundary(deleteTable),
  // ],
  finishTable: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(tableNotVacant),
    asyncErrorBoundary(finishTable)
  ]
};
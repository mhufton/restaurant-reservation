const service = require("./tables.service");
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

// middleware
async function tableExists(req, res, next) {
  const { tableId } = req.params;
  const foundTable = await service.read(tableId);
  if (foundTable) {
    res.locals.table = foundTable;
    return next();
  }
  next({
    status: 404,
    message: `TableId ${tableId} cannot be found.`
  })
}

async function hasProps(req, res, next) {
  const {
    data: {
      table_name,
      capacity,
      status,
    }
  } = req.body;
  let message = "";
  if (table_name.length < 2) {
    message = "CONTROLLER: Table names must be at least 2 characters long."
  }
  if (capacity < 1) {
    message = "CONTROLLER: Table capacity must be a number larger than 0."
  }
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

async function list(req, res) {
  res.json({ data: await service.list() })
};

async function read(req, res) {
  res.json({ data: res.locals.table })
}

async function create(req, res) {
  const table = req.body.data;
  console.log("***** table", table)
  const data = await service.create(table)
  res.status(201).json({ data })
}

async function update(req, res) {
  const table_id = res.locals.table[0].table_id;
  const updatedTable = req.body;
  await service.update(table_id, updatedTable);
  res.status(201).json({ data: updatedTable })
}

async function destroy(req, res) {
  const tableId = res.locals.tables[0].table_id;
  await service.destroy(tableId);
  res.sendStatus(204)
}

module.exports = {
  list: list,
  create: [hasProps, create],
  read: [tableExists, read],
  update: [tableExists, update],
  destroy: [tableExists, destroy],
}
import React, { useState, useEffect } from 'react';

import { listTables } from '../utils/api';

export default function Seat() {
  const [tables, setTables] = useState([]);
  const [seatErrors, setSeatErrors] = useState([]);
   
  function loadTables() {
    const abortController = new AbortController();
    setSeatErrors(null);
    listTables(abortController.signal)
      .then(setTables)
      .catch(setSeatErrors);
    return () => abortController.abort();
  }
  useEffect(loadTables)

  console.log("tables", tables)

  const mapTables = () => {
    const newTable = tables.sort((a, b) => b.status - a.status);
    return newTable.map((table, index) => {
      return (
        <div>
          <p>{table.table_name} - {table.capacity}</p>
          <>
            {table.status === true
              ? <button>Submit</button>
              : <p>Occupied</p>}
          </>
          <button>Cancel</button>
        </div>
    )})
  }

  return (
    <div>
      {mapTables()}
    </div>
    )
}
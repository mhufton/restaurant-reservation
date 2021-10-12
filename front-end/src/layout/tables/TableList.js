import React from 'react';

export default function TableList({ tables }) {
  return tables.map((table, index) => {
    return (
      <div key={index}>
        <p>Table: {table.table_name} - Capacity: {table.capacity}</p>
        Status: {table.status} - <button>edit</button>
      </div>
    )
  })
}
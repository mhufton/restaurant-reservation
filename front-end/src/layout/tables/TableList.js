import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import ErrorAlert from '../ErrorAlert';
import { finishTable } from '../../utils/api';

export default function TableList({ tables }) {
  const history = useHistory();

  const [errors, setErrors] = useState(null);

  return tables.map((table, index) => {
    const finishHandler = (e) => {
      e.preventDefault();
      console.log("finishing finish handler")
      const confirmBox = window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      );
      console.log("confirmBox", confirmBox)
      if (confirmBox === true) {
        finishTable(table.table_id).catch(setErrors);
        history.go();
      }
    }

    return (
      <div>
        <div>
          {errors ? <ErrorAlert error={errors} /> : null}
        </div>
        <div key={index} >
          <p>Table: {table.table_name} - Capacity: {table.capacity}</p>
          Status: {table.status} 
          {table.status.toLowerCase() === "occupied" 
            ? <button onClick={finishHandler}>Finish</button> 
            : null}
        </div>
      </div>
    )
  })
}
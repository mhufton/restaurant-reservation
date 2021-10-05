import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import { Link } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

import formatReservationDate from "../utils/format-reservation-date";
import formatReservationTime from "../utils/format-reservation-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  useEffect(loadDashboard, [date]);
  console.log("dashboard date", date);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  const mapReservations = () => {
    const newReservations = reservations.sort((a, b) => a.reservation_time - b.reservation_time);
    return newReservations.map((res, index) => {
      return (
        <div key={index}>
          <div>
            <p className="resName">{res.first_name} {res.last_name}</p>
            <p className="resDate">{res.reservation_date} at {res.reservation_time}</p>
            <p className="resMobile">{res.mobile_number}</p>
          </div>
          <div>
            <Link to={`/reservations/${res.reservation_id}/seat`}>
              <button>Seat</button>
            </Link>
            <Link to={`/reservations/${res.reservation_id}`}>
              <button>Edit</button>
            </Link>
          </div>
          <br />
        </div>
        
      )
    })
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      {mapReservations()}
      <div>
        <label>
          Choose Date:
          <input 
            type='date'
            id="date"
            name='date'
            // onChange={handleChange}
            // value={formData.date}
            />
        </label>
        <br />
        <label>
          Choose Time:
          <input 
            type='time'
            id="time"
            name='time'
            required={true}
            // onChange={handleChange}
            // value={formData.time}
            />
        </label>
      </div>
    </main>
  );
}

export default Dashboard;

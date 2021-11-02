import React, { useEffect, useState } from "react";

import { listReservations, listTables } from "../utils/api";
import { today, previous, next } from "../utils/date-time"
import ErrorAlert from "../layout/ErrorAlert";
import ReservationsList from "../layout/Reservations/ReservationsList";
import TableList from "../layout/tables/TableList";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ setReservation_id }) {
  const date = today();
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const [viewDate, setViewDate] = useState(date);
  console.log("error on dashboard:", error)
  console.log('reservations.length', reservations.length)
  console.log('reservations', reservations)

  useEffect(() => {
    const abortController = new AbortController();
  
    async function loadReservations() {
      try {
        if (viewDate === date) {
          console.log(`getting res for ${viewDate}`)
          const reservationDate = await listReservations({ date }, abortController.signal);
          setReservations(reservationDate);
          setError(null)
        } else {
          console.log(`getting res for ${viewDate}`)
          const reservationDate = await listReservations({ viewDate }, abortController.signal);
          setError(null);
          setReservations(reservationDate)
        }
      } catch (error) {
        setReservations([]);
        setError(error);
      }
    }
    loadReservations();
    return () => abortController.abort();
  }, [date, viewDate]);
  


  useEffect(() => {
    const abortController = new AbortController();
    async function loadTables() {
      try { 
        setError(null);
        const tableList = await listTables(abortController.signal);
        setTables(tableList);
      } catch (error) {
        setTables([]);
        setError(error.message);
      }
    }
    loadTables();
    return () => abortController.abort();
  }, [])

  const handlePrevious = (e) => {
    e.preventDefault();
    setViewDate(previous(viewDate));
  }

  const handleToday = (e) => {
    e.preventDefault();
    setViewDate(date);
  }

  const handleNext = (e) => {
    e.preventDefault();
    setViewDate(next(viewDate))
  }
  
  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Date: {viewDate}</h4>
      </div>
      <div>
        <button onClick={handlePrevious}>Previous</button>
        <button onClick={handleToday}>Today</button>
        <button onClick={handleNext}>Next</button>
      </div>
      <div>
        
        <div>
          <h4>Reservations</h4>
          {reservations.length > 0
            ? <ReservationsList reservations={reservations} setReservation_id={setReservation_id} />
            : <ErrorAlert error={`There are no reservations for ${viewDate}`} />
          }
        </div>
        <div>
          <h4>Tables:</h4>
          <TableList tables={tables} />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;

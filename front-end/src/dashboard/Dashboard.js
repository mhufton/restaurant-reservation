import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";

import ErrorAlert from "../layout/ErrorAlert";
import ReservationsList from "../layout/Reservations/ReservationsList";
import TableList from "../layout/tables/TableList";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date, setReservation_id }) {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [dashboardError, setDashboardError] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadDashboard() {
      try {
        setDashboardError([]);
        const reservationDate = await listReservations({ date }, abortController.signal);
        setReservations(reservationDate);
      } catch (error) {
        setReservations([]);
        setDashboardError([error.message]);
      }
    }
    loadDashboard();
    return () => abortController.abort();
  }, [date]);


  useEffect(() => {
    const abortController = new AbortController();
    async function loadTables() {
      try { 
        setDashboardError([]);
        const tableList = await listTables(abortController);
        setTables(tableList);
      } catch (error) {
        setTables([]);
        setDashboardError([error.message]);
      }
    }
    loadTables();
    return () => abortController.abort();
  }, [])

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div>
      <div>
        <ErrorAlert error={dashboardError} />
        {/* {mapReservations()} */}
        <ReservationsList reservations={reservations} setReservation_id={setReservation_id} />
        {/* <TableList tables={tables} /> */}
      </div>
    </main>
  );
}

export default Dashboard;

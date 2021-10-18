import React from 'react';
import { Link, useHistory } from "react-router-dom";

import ErrorAlert from '../ErrorAlert';
import Reservation from './Reservation';
import { updateReservationStatus } from '../../utils/api';

export default function ReservationsList({ reservations, setReservation_id }) {
  const [errors, setErrors] = React.useState(null);
  const history = useHistory();

  const filteredReservations = reservations
    .filter((reservation) => reservation.status.toLowerCase() !== "finished")

  return filteredReservations.map((reservation, index) => {
    const reservation_id = reservation.reservation_id;

    const handleCancel = () => {
      const abortController = new AbortController();
      const confirmWindow = window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      );
      if (confirmWindow) {
        async function updatingReservation() {
          try {
            await updateReservationStatus(
              { status: "Canceled" },
              reservation.reservation_id
            )
            history.go();
          } catch (error) {
            setErrors(error)
          }
        }
        updatingReservation();
        return () => abortController.abort();
      } 
    }

    return (
      <div key={reservation.reservation_id}>
        <div>
          {errors ? <ErrorAlert error={errors} /> : null}
        </div>
        <div>
          <Reservation reservation={reservation} />
        </div>
        <div>
          {/* <Link to={`/reservations/${reservation_id}/seat`}>
            <button onClick={() => {
              setReservation_id(reservation.reservation_id)
            }}>
              Seat
            </button>
          </Link> */}
          <a href={`/reservations/${reservation_id}/seat`}>
            <button onClick={() => {
              setReservation_id(reservation.reservation_id)
            }}>
              Seat
            </button>
          </a>
          <Link to={`/reservations/${reservation.reservation_id}/edit`} >
          <button onClick={() => {
              setReservation_id(reservation.reservation_id)
            }}>
              Edit
            </button>
          </Link>
          <button 
              data-reservation-id-cancel={reservation.reservation_id}
              onClick={handleCancel}>
              Cancel
            </button>
        </div>
        <br />
      </div>
    )
  })
}
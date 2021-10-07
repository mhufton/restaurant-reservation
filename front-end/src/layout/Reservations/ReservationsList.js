import React from 'react';
import { Link } from "react-router-dom";

export default function ReservationsList({ reservations, setReservation_id }) {
  const newReservations = reservations.sort((a, b) => a.reservation_time - b.reservation_time);
  return newReservations.map((res, index) => {
    return (
      <div key={index}>
        <div>
          <p className="fullName">{res.first_name} {res.last_name}</p>
          <p className="reservation_date">{res.reservation_date} at {res.reservation_time}</p>
          <p className="mobile_number">{res.mobile_number}</p>
        </div>
        <div>
          <Link to={`/reservations/${res.reservation_id}/seat`}>
            <button onClick={() => {
              console.log("setting resId", res.reservation_id)
              setReservation_id(res.reservation_id)
            }}>
              Seat
            </button>
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
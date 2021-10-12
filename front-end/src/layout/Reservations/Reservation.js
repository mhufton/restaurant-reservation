import React from 'react';

export default function Reservation({ reservation }) {
  
  return (
      <div>
      <p>{reservation.first_name} {reservation.last_name}</p>
      <p>{reservation.reservation_date} at {reservation.reservation_time}</p>
      <p>People in party: {reservation.people}</p>
    </div>
  )
}
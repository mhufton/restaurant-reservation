import React from 'react';

export default function Reservation({ reservation, key }) {
  
  return (
    <div key={key}>
      <p>{reservation.first_name} {reservation.last_name}</p>
      <p>{reservation.reservation_date} at {reservation.reservation_time}</p>
      <p>People in party: {reservation.people}</p>
    </div>
  )
}
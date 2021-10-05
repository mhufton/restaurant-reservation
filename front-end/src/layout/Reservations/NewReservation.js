import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'
import { createReservation } from '../../utils/api';

export default function NewReservation() {
  const history = useHistory();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    })
  }

  const validateReservation = () => {
    const today = new Date();
    const resDate = new Date(formData.reservation_date);
    const resTime = formData.reservation_time;
    let errorArray = [];
    const people = formData.people;
  
    if (resDate.getDay() === "Tue") {
      errorArray.push(new Error("Restaurant is closed on Tuesdays. Please choose a different day."))
    }
    if (resTime < "10:30") {
      errorArray.push(new Error("Restaurant opens at 10:30AM. Please choose a different time."))
    }
    if (resTime > "21:30") {
      errorArray.push(new Error("Last reservations are at 9:30PM. Please choose a different time"))
    }
    if (resDate < today) {
      errorArray.push(new Error("You can only set reservations for future dates. Please choose a different date."))
    }
    if (!people) {
      errorArray.push(new Error("Reservations must inlcude the amount of peoples in the reservation"))
    }
    // if (people === "0") {
    //   errorArray.push(new Error("The amount of people in a party must be larger than 0"))
    // }

    if (errorArray.length > 0) {
      window.confirm(errorArray);
      errorArray = [];
    }
    return true
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    const reservation = {
         ...formData,
         status: "booked"
       }
    if (validateReservation()) {
      createReservation(reservation)
        .then(() => console.log("data!"))
        .then((output) =>
          history.push(`/dashboard?date=${formData.reservation_date}`)
        )
    }
  };

  return (
    <div>
      <h1>New Reservations</h1>
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input 
            type="text"
            id='first_name'
            name="first_name"
            required={true}
            placeholder='enter first name'
            onChange={handleChange}
            value={formData.first_name}
            />
        </label>
        <br />
        <label>
          Last Name:
          <input 
            type='text'
            id="last_name"
            name="last_name"
            required={true}
            placeholder='enter last name'
            onChange={handleChange}
            value={formData.last_name}
            />
        </label>
        <br />
        <label>
          Phone Number:
          <input
            type="text"
            id='mobile_number'
            name='mobile_number'
            required={true}
            placeholder='enter phone number'
            onChange={handleChange}
            value={formData.mobile_number}
          />
        </label>
        <br />
        <label>
          Reservation Date:
          <input 
            type="date"
            id="date"
            name="reservation_date"
            required={true}
            onChange={handleChange}
            value={formData.reservation_date}
            />
        </label>
        <br />
        <label>
          Reservation Time:
          <input 
            type="time"
            id="time"
            name="reservation_time"
            required={true}
            onChange={handleChange}
            value={formData.reservation_time}
            />
        </label>
        <br />
        <label>
          People in party:
          <input 
            type='number' 
            id="people"
            name='people'
            required={true}
            placeholder='enter number'
            onChange={handleChange}
            value={formData.people}
            />
        </label>
        <br />
        <button 
          type="submit"
          >Submit</button>
        <button 
          type='cancel' 
          className='cancelButton'
          onClick={() => {
            const confirmBox = window.confirm(
              "If you cancel all information will be lost"
            )
            if (confirmBox === true) {
              console.log("going back a page")
              // handleCancel();
            }
          }}>
            Cancel
          </button>
      </form>
    </div>
  )
}
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'
import { createReservation } from "../utils/api";

import ErrorAlert from './ErrorAlert';
import { ValidateReservation } from './Validators';

export default function NewReservation() {
  const history = useHistory();
  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    peopleInParty: "",
  }

  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    })
    // console.log("form data changed")
    // console.log(formData.reservation_date, formData.reservation_time)
  }

  const ValidateReservation = () => {
    const today = new Date();
    const resDate = new Date(formData.reservation_date);
    const resTime = formData.reservation_time;
    const errorArray = [];
  
    if (resDate.getDay() === 2) {
      errorArray.push({ message: "Restaurant is closed on Tuesdays. Please choose a different day." })
    }
    if (resTime < "10:30") {
      errorArray.push({ message: "Restaurant opens at 10:30AM. Please choose a different time." })
    }
    if (resTime > "21:30") {
      errorArray.push({ message: "Last reservations are at 9:30PM. Please choose a different time" })
    }
    if (resDate < today) {
      errorArray.push({ message: "You can only set reservations for future dates. Please choose a different date." })
    }
  
    setErrors(errorArray);
    if (errorArray.length > 0) {
      return false
    }
    return true
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (ValidateReservation()) {
  //     createReservation(formData)
  //       .then((output) => 
  //         history.push(`/dashboard?date=${formData.reservation_date}`))
  //       .catch(errors);
  //   }
  // }

  const handleSubmit = async(e) => {
    console.log("submitting...")
    e.preventDefault();
    const url = `http://localhost:5000/reservations`;
    const options = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ data: formData }),
    }
    const result = await fetch(url, options);
    console.log("result", result)
  //  return await fetchJson(url, options)
  }

  const callErrors = () => {
    return errors.map((err, key) => {
      <ErrorAlert key={key} error={err} />
    })
  }

  return (
    <div>
      <h1>New Reservations</h1>
      <form onSubmit={handleSubmit}>
        {errors.length > 0 ? callErrors() : null}
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
            id="peopleInParty"
            name='peopleInParty'
            required={true}
            placeholder='enter number'
            onChange={handleChange}
            value={formData.peopleInParty}
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
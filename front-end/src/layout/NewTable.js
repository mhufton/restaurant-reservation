import React, { useState } from 'react';
import ErrorAlert from './ErrorAlert';

export default function NewTable() {
  const initialFormState = {
    table_name: "",
    people: "",
  }

  const [formData, setFormData] = useState({ ...initialFormState });
  const [errors, setErrors] = useState([])

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    })
    console.log("form data changed")
  }

  const ValidateTable = () => {
    const errorArray = [];
  
    if (formData.table_name.length < 2) {
      errorArray.push({ message: "Table names must be at least 2 characters."})
    }
    if (formData.capacity < 1) {
      errorArray.push({ message: "Table capacity must be at least 1 person."})
    }
  
    setErrors(errorArray);
    if (errorArray.length > 0) {
      return false
    }
    return true
  }
  
  const submitHandler = (e) => {
    e.preventDefault();
    if (ValidateTable()) {
      // need to sort what I'm doing with this info
      console.log('submitted table form')
    }
  }

  const errorList = () => {
    return errors.map((error, index) => {
      <ErrorAlert key={index} error={error} />
    })
  }

  return (
    <div>
      <h1>New Reservations</h1>
      <form name='newTable' onSubmit={submitHandler}>
        {errorList()}
        <label>
          Table Name:
          <input 
            type="text"
            name="table_name"
            id="table_name"
            value={formData.table_name}
            require={true}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Capacity:
          <input 
            type="number"
            name="capacity"
            id="capacity"
            value={formData.people}
            required={true}
            onChange={handleChange}
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
            }
          }}>
            Cancel
          </button>
      </form>
    </div>
    )
}
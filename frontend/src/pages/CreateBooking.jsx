// src/pages/CreateBooking.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api";

export default function CreateBooking() {
  const [bookingName, setBookingName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [surname, setSurname] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);

  // All possible slots
  const allSlots = [
    "07:00","07:10","07:20","07:30","07:40","07:50",
    "08:00","08:10","08:20","08:30","08:40","08:50","09:00"
  ];

  // Fetch existing bookings when date changes
  useEffect(() => {
    if (!scheduleDate) {
      setAvailableTimes([]);
      return;
    }

    axios
      .get(`${API_URL}/bookings`, { params: { date: scheduleDate } })
      .then((res) => {
        const bookedTimes = res.data.map((b) => b.schedule_time);
        const freeSlots = allSlots.filter((t) => !bookedTimes.includes(t));
        setAvailableTimes(freeSlots);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setAvailableTimes([]);
      });
  }, [scheduleDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/bookings`, {
        booking_name: bookingName,
        firstname,
        surname,
        schedule_date: scheduleDate,
        schedule_time: scheduleTime,
        cellphone,
      });
      alert("Booking created!");
      setBookingName("");
      setFirstname("");
      setSurname("");
      setScheduleDate("");
      setScheduleTime("");
      setCellphone("");
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "24px auto", fontFamily: "sans-serif" }}>
      <h2>Create Booking</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Booking Name"
          value={bookingName}
          onChange={(e) => setBookingName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Firstname"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />

        <input
          type="date"
          value={scheduleDate}
          onChange={(e) => setScheduleDate(e.target.value)}
          required
        />

        {/* Show available slots when date is chosen */}
        {scheduleDate && (
          <div style={{ margin: "10px 0" }}>
            <strong>Available times:</strong>
            <ul>
              {availableTimes.length > 0 ? (
                availableTimes.map((t) => <li key={t}>{t}</li>)
              ) : (
                <li>All slots booked</li>
              )}
            </ul>
          </div>
        )}

        <input
          type="time"
          value={scheduleTime}
          onChange={(e) => setScheduleTime(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Cellphone e.g. 276XXXXXXXX"
          value={cellphone}
          onChange={(e) => setCellphone(e.target.value)}
          required
        />

        <button type="submit">Create Booking</button>
      </form>
    </div>
  );
}

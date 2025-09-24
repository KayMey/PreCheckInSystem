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

  // generate all slots 07:00 - 09:00 in 10-min steps
  const allSlots = Array.from({ length: 13 }, (_, i) => {
    const h = 7 + Math.floor(i / 6);
    const m = (i % 6) * 10;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (!scheduleDate) {
      setAvailableTimes([]);
      return;
    }
    axios
      .get(`${API_URL}/bookings`, { params: { status: "" } })
      .then((res) => {
        const bookings = res.data || [];
        const taken = bookings
          .filter((b) => b.schedule_date === scheduleDate)
          .map((b) => b.schedule_time);
        const free = allSlots.filter((t) => !taken.includes(t));
        setAvailableTimes(free);
      })
      .catch(() => setAvailableTimes(allSlots));
  }, [scheduleDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${API_URL}/bookings`, {
        booking_name: bookingName,
        firstname,
        surname,
        schedule_date: scheduleDate,
        schedule_time: scheduleTime,
        cellphone,
      })
      .then(() => {
        alert("✅ Booking created");
        setBookingName("");
        setFirstname("");
        setSurname("");
        setScheduleDate("");
        setScheduleTime("");
        setCellphone("");
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Error creating booking");
      });
  };

  return (
    <div style={{ maxWidth: 600, margin: "24px auto", fontFamily: "sans-serif" }}>
      <h2>Create Booking</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Booking Name"
          value={bookingName}
          onChange={(e) => setBookingName(e.target.value)}
          required
        />
        <br />
        <input
          placeholder="Firstname"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        />
        <br />
        <input
          placeholder="Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />
        <br />
        <input
          type="date"
          value={scheduleDate}
          onChange={(e) => setScheduleDate(e.target.value)}
          required
        />
        {scheduleDate && (
          <div style={{ marginTop: "8px" }}>
            <strong>Available times:</strong>
            <ul>
              {availableTimes.length > 0 ? (
                availableTimes.map((t) => <li key={t}>{t}</li>)
              ) : (
                <li>No slots left</li>
              )}
            </ul>
          </div>
        )}
        <br />
        <input
          type="time"
          value={scheduleTime}
          onChange={(e) => setScheduleTime(e.target.value)}
          required
        />
        <br />
        <input
          placeholder="Cellphone e.g. 276XXXXXXXX"
          value={cellphone}
          onChange={(e) => setCellphone(e.target.value)}
          required
        />
        <br />
        <button type="submit">Create Booking</button>
      </form>
    </div>
  );
}

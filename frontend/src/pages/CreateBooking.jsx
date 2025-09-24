import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api";

export default function CreateBooking() {
  const [form, setForm] = useState({
    booking_name: "",
    firstname: "",
    surname: "",
    schedule_date: "",
    schedule_time: "",
    cellphone: "",
  });

  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);

  // Generate all times from 07:00–09:00 in 10-minute intervals
  const generateAllTimes = () => {
    const times = [];
    for (let h = 7; h <= 9; h++) {
      for (let m = 0; m < 60; m += 10) {
        if (h === 9 && m > 0) break; // stop at 09:00
        const hh = h.toString().padStart(2, "0");
        const mm = m.toString().padStart(2, "0");
        times.push(`${hh}:${mm}`);
      }
    }
    return times;
  };

  // Fetch booked times for a selected date
  useEffect(() => {
    if (form.schedule_date) {
      axios
        .get(`${API_URL}/bookings`, { params: { date: form.schedule_date } })
        .then((res) => {
          const times = res.data.map((b) => b.schedule_time);
          setBookedTimes(times);
        })
        .catch(() => setBookedTimes([]));
    } else {
      setBookedTimes([]);
    }
  }, [form.schedule_date]);

  // Compute available times (exclude booked ones)
  useEffect(() => {
    const all = generateAllTimes();
    const available = all.filter((t) => !bookedTimes.includes(t));
    setAvailableTimes(available);
  }, [bookedTimes]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${API_URL}/bookings`, form)
      .then(() => {
        alert("Booking created successfully");
        setForm({
          booking_name: "",
          firstname: "",
          surname: "",
          schedule_date: "",
          schedule_time: "",
          cellphone: "",
        });
        setAvailableTimes([]);
      })
      .catch((err) => {
        alert(err.response?.data?.error || err.message);
      });
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "24px auto",
        padding: 24,
        border: "1px solid #ddd",
        borderRadius: 12,
        background: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Pre-Check-In Demo System</h1>
      <h2 style={{ textAlign: "center" }}>Create Booking</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="booking_name"
          placeholder="Booking Name"
          value={form.booking_name}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />
        <input
          type="text"
          name="firstname"
          placeholder="Firstname"
          value={form.firstname}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />
        <input
          type="text"
          name="surname"
          placeholder="Surname"
          value={form.surname}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />
        <input
          type="date"
          name="schedule_date"
          value={form.schedule_date}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        {/* Show available times if a date is selected */}
        {form.schedule_date && (
          <div style={{ marginBottom: 12 }}>
            <strong>Available times:</strong>
            <ul style={{ marginTop: 6, paddingLeft: 20 }}>
              {availableTimes.length > 0 ? (
                availableTimes.map((t) => <li key={t}>{t}</li>)
              ) : (
                <li style={{ color: "red" }}>No available times</li>
              )}
            </ul>
          </div>
        )}

        <input
          type="time"
          name="schedule_time"
          value={form.schedule_time}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />
        <input
          type="text"
          name="cellphone"
          placeholder="Cellphone e.g. 276XXXXXXXX"
          value={form.cellphone}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            background: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 16,
          }}
        >
          Create Booking
        </button>
      </form>
    </div>
  );
}

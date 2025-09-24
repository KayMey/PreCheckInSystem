import { useState } from "react";
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

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/bookings`, form);
      alert("✅ Booking created successfully!");
      setForm({
        booking_name: "",
        firstname: "",
        surname: "",
        schedule_date: "",
        schedule_time: "",
        cellphone: "",
      });
    } catch (err) {
      alert(err.response?.data?.error || "Error creating booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8f9fa",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
          Pre-Check-In Demo System
        </h1>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Create Booking
        </h2>

        <form onSubmit={handleSubmit}>
          <label>Booking Name</label>
          <input
            name="booking_name"
            value={form.booking_name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
          />

          <label>Firstname</label>
          <input
            name="firstname"
            value={form.firstname}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
          />

          <label>Surname</label>
          <input
            name="surname"
            value={form.surname}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
          />

          <label>Schedule Date</label>
          <input
            type="date"
            name="schedule_date"
            value={form.schedule_date}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
          />

          <label>Schedule Time</label>
          <input
            type="time"
            name="schedule_time"
            value={form.schedule_time}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
          />

          <label>Cellphone</label>
          <input
            name="cellphone"
            value={form.cellphone}
            onChange={handleChange}
            required
            placeholder="e.g. 276XXXXXXXX"
            style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {loading ? "Creating..." : "Create Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

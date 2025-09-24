import React, { useState } from "react";
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
      alert("Booking created successfully!");
      setForm({
        booking_name: "",
        firstname: "",
        surname: "",
        schedule_date: "",
        schedule_time: "",
        cellphone: "",
      });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create booking");
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
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Pre-Check-In Demo System
        </h1>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Create Booking</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="booking_name"
            placeholder="Booking Name"
            value={form.booking_name}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          />
          <input
            type="text"
            name="firstname"
            placeholder="Firstname"
            value={form.firstname}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          />
          <input
            type="text"
            name="surname"
            placeholder="Surname"
            value={form.surname}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          />
          <input
            type="date"
            name="schedule_date"
            value={form.schedule_date}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          />
          <input
            type="time"
            name="schedule_time"
            value={form.schedule_time}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          />
          <input
            type="text"
            name="cellphone"
            placeholder="Cellphone e.g. 276XXXXXXXX"
            value={form.cellphone}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: "20px", padding: "10px" }}
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
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

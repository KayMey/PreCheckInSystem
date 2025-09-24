import { useState } from "react";
import axios from "axios";
import { API_URL } from "../api";
import Layout from "../Layout";

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
      alert("Booking created and SMS sent!");
      setForm({
        booking_name: "",
        firstname: "",
        surname: "",
        schedule_date: "",
        schedule_time: "",
        cellphone: "",
      });
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Pre-Check-In Demo System">
      <h3 style={{ marginBottom: "20px" }}>Create Booking</h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "350px" }}>
        <input type="text" name="booking_name" value={form.booking_name} onChange={handleChange} placeholder="Booking Name" required />
        <input type="text" name="firstname" value={form.firstname} onChange={handleChange} placeholder="Firstname" required />
        <input type="text" name="surname" value={form.surname} onChange={handleChange} placeholder="Surname" required />
        <input type="date" name="schedule_date" value={form.schedule_date} onChange={handleChange} required />
        <input type="time" name="schedule_time" value={form.schedule_time} onChange={handleChange} required />
        <input type="text" name="cellphone" value={form.cellphone} onChange={handleChange} placeholder="Cellphone (e.g. 276XXXXXXXX)" required />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Submitting..." : "Create Booking"}
        </button>
      </form>
    </Layout>
  );
}

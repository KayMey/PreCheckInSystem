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
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Create Booking</h2>
        <form onSubmit={handleSubmit}>
          {["booking_name", "firstname", "surname", "schedule_date", "schedule_time", "cellphone"].map((field) => (
            <div key={field} style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#000" }}>
                {field.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </label>
              <input
                type={field.includes("date") ? "date" : field.includes("time") ? "time" : "text"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {loading ? "Saving..." : "Create Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

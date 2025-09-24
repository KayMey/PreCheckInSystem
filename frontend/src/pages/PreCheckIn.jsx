import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PreCheckin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form state
  const [dropoffFirstname, setDropoffFirstname] = useState("");
  const [dropoffSurname, setDropoffSurname] = useState("");
  const [dropoffPhone, setDropoffPhone] = useState("");
  const [file, setFile] = useState(null);

  // ✅ use correct env var
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/bookings/${id}`);
        setBooking(res.data);
      } catch (err) {
        setError("Invalid or expired link.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, BACKEND_URL]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please upload a driver’s license image.");
      return;
    }

    const formData = new FormData();
    formData.append("dropoff_firstname", dropoffFirstname);
    formData.append("dropoff_surname", dropoffSurname);
    formData.append("dropoff_phone", dropoffPhone);
    formData.append("license", file);

    try {
      await axios.put(`${BACKEND_URL}/bookings/${id}/precheckin`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Submitted successfully!");
      navigate("/employee/view");
    } catch (err) {
      console.error("Pre-check-in error:", err.response?.data || err.message);
      setError("Failed to complete pre-check-in. Try again.");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading booking...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

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
        <h2 style={{ textAlign: "center" }}>Pre-Check-In</h2>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Please fill in the information below for the person dropping off the vehicle
        </p>

        <p><strong>Booking:</strong> {booking.booking_name}</p>
        <p><strong>Customer:</strong> {booking.firstname} {booking.surname}</p>
        <p><strong>Date:</strong> {booking.schedule_date}</p>
        <p><strong>Time:</strong> {booking.schedule_time}</p>

        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#000" }}>
            First Name:
          </label>
          <input
            type="text"
            value={dropoffFirstname}
            onChange={(e) => setDropoffFirstname(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />

          <label style={{ display: "block", marginBottom: "5px", color: "#000" }}>
            Last Name:
          </label>
          <input
            type="text"
            value={dropoffSurname}
            onChange={(e) => setDropoffSurname(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />

          <label style={{ display: "block", marginBottom: "5px", color: "#000" }}>
            Cell Phone:
          </label>
          <input
            type="text"
            value={dropoffPhone}
            onChange={(e) => setDropoffPhone(e.target.value)}
            placeholder="e.g. 276XXXXXXXX"
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />

          <label style={{ display: "block", marginBottom: "5px", color: "#000" }}>
            Upload Driver’s License:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
            style={{ display: "block", marginBottom: "20px" }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

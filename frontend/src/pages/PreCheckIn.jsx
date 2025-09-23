import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PreCheckin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // e.g. https://precheckinsystem.onrender.com

  // 🔹 Fetch booking details
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
  }, [id]);

  // 🔹 Handle file upload + confirmation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please upload a driver’s license image.");
      return;
    }

    const formData = new FormData();
    formData.append("license", file);

    try {
      await axios.put(`${BACKEND_URL}/bookings/${id}/precheckin`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Pre-check-in completed!");
      navigate("/employee/view"); // send them back to the booking view
    } catch (err) {
      console.error(err);
      setError("Failed to complete pre-check-in. Try again.");
    }
  };

  if (loading) return <p>Loading booking...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pre-Check-In</h2>
      <p><strong>Booking:</strong> {booking.booking_name}</p>
      <p><strong>Name:</strong> {booking.firstname} {booking.surname}</p>
      <p><strong>Date:</strong> {booking.schedule_date}</p>
      <p><strong>Time:</strong> {booking.schedule_time}</p>

      <form onSubmit={handleSubmit}>
        <label>Upload Driver’s License:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br /><br />
        <button type="submit">Complete Pre-Check-In</button>
      </form>
    </div>
  );
}

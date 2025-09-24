import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PreCheckin() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // form state
  const [dropoffFirstname, setDropoffFirstname] = useState("");
  const [dropoffSurname, setDropoffSurname] = useState("");
  const [dropoffPhone, setDropoffPhone] = useState("");
  const [dropoffIdNumber, setDropoffIdNumber] = useState(""); // ✅ new field
  const [file, setFile] = useState(null);

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
    formData.append("dropoff_id_number", dropoffIdNumber); // ✅ include in request
    formData.append("license", file);

    try {
      await axios.put(`${BACKEND_URL}/bookings/${id}/precheckin`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
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
        {!submitted ? (
          <>
            <h2
              style={{
                textAlign: "center",
                color: "#000",
                WebkitTextFillColor: "#000",
              }}
            >
              Pre-Check-In
            </h2>
            <p
              style={{
                textAlign: "center",
                marginBottom: "20px",
                color: "#000",
                WebkitTextFillColor: "#000",
              }}
            >
              Please fill in the information below for the person dropping off the vehicle
            </p>

            <p style={{ color: "#000", WebkitTextFillColor: "#000" }}>
              <strong>Booking:</strong> {booking.booking_name}
            </p>
            <p style={{ color: "#000", WebkitTextFillColor: "#000" }}>
              <strong>Customer:</strong> {booking.firstname} {booking.surname}
            </p>
            <p style={{ color: "#000", WebkitTextFillColor: "#000" }}>
              <strong>Date:</strong> {booking.schedule_date}
            </p>
            <p style={{ color: "#000", WebkitTextFillColor: "#000" }}>
              <strong>Time:</strong> {booking.schedule_time}
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#000", WebkitTextFillColor: "#000" }}>
                First Name:
              </label>
              <input
                type="text"
                value={dropoffFirstname}
                onChange={(e) => setDropoffFirstname(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  color: "#000",
                  WebkitTextFillColor: "#000",
                  background: "#fff",
                }}
              />

              <label style={{ display: "block", marginBottom: "5px", color: "#000", WebkitTextFillColor: "#000" }}>
                Last Name:
              </label>
              <input
                type="text"
                value={dropoffSurname}
                onChange={(e) => setDropoffSurname(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  color: "#000",
                  WebkitTextFillColor: "#000",
                  background: "#fff",
                }}
              />

              <label style={{ display: "block", marginBottom: "5px", color: "#000", WebkitTextFillColor: "#000" }}>
                Cell Phone:
              </label>
              <input
                type="text"
                value={dropoffPhone}
                onChange={(e) => setDropoffPhone(e.target.value)}
                placeholder="e.g. 276XXXXXXXX"
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  color: "#000",
                  WebkitTextFillColor: "#000",
                  background: "#fff",
                }}
              />

              {/* New ID Number field */}
              <label style={{ display: "block", marginBottom: "5px", color: "#000", WebkitTextFillColor: "#000" }}>
                ID Number:
              </label>
              <input
                type="text"
                value={dropoffIdNumber}
                onChange={(e) => setDropoffIdNumber(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  color: "#000",
                  WebkitTextFillColor: "#000",
                  background: "#fff",
                }}
              />

              <label style={{ display: "block", marginBottom: "5px", color: "#000", WebkitTextFillColor: "#000" }}>
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
          </>
        ) : (
          <h3 style={{ color: "green", textAlign: "center" }}>
            Thank you! Your pre-check-in has been submitted.
          </h3>
        )}
      </div>
    </div>
  );
}

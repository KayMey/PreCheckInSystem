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
  const [dropoffIdNumber, setDropoffIdNumber] = useState("");
  const [file, setFile] = useState(null);

  // licence verification state
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");

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

  // Resize + compress image before sending
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Verify licence with Netlify function
  const handleVerify = async () => {
    if (!file) {
      setVerifyError("Please upload a driver’s license image.");
      return;
    }

    setVerifying(true);
    setVerifyError("");
    setVerified(false);

    try {
      const imageBase64 = await resizeImage(file);
      const res = await axios.post("/.netlify/functions/verify-license", {
        imageBase64,
      });

      if (res.data.verified) {
        setVerified(true);
      } else {
        setVerifyError("Licence could not be verified. Try a clearer photo.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerifyError("Verification error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // Handle final submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verified) {
      setError("Please verify the driver’s licence before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("dropoff_firstname", dropoffFirstname);
    formData.append("dropoff_surname", dropoffSurname);
    formData.append("dropoff_phone", dropoffPhone);
    formData.append("dropoff_id_number", dropoffIdNumber);
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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8f9fa" }}>
      <div style={{ background: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "100%", maxWidth: "500px" }}>
        {!submitted ? (
          <>
            <h2 style={{ textAlign: "center", color: "#000" }}>Pre-Check-In</h2>
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#000" }}>
              Please fill in the information below for the person dropping off the vehicle
            </p>

            <p><strong>Booking:</strong> {booking.booking_name}</p>
            <p><strong>Customer:</strong> {booking.firstname} {booking.surname}</p>
            <p><strong>Date:</strong> {booking.schedule_date}</p>
            <p><strong>Time:</strong> {booking.schedule_time}</p>

            <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
              <label>First Name:</label>
              <input type="text" value={dropoffFirstname} onChange={(e) => setDropoffFirstname(e.target.value)} required />

              <label>Last Name:</label>
              <input type="text" value={dropoffSurname} onChange={(e) => setDropoffSurname(e.target.value)} required />

              <label>Cell Phone:</label>
              <input type="text" value={dropoffPhone} onChange={(e) => setDropoffPhone(e.target.value)} placeholder="e.g. 276XXXXXXXX" required />

              <label>ID Number:</label>
              <input type="text" value={dropoffIdNumber} onChange={(e) => setDropoffIdNumber(e.target.value)} required />

              <label>Upload Driver’s Licence (front):</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />

              {/* Verify licence button */}
              <button type="button" onClick={handleVerify} disabled={verifying} style={{ marginTop: "10px", width: "100%" }}>
                {verifying ? "Verifying..." : "Verify Licence"}
              </button>
              {verified && <p style={{ color: "green" }}>✓ Licence verified</p>}
              {verifyError && <p style={{ color: "red" }}>{verifyError}</p>}

              {/* Submit only when verified */}
              <button type="submit" disabled={!verified} style={{ marginTop: "15px", width: "100%" }}>
                Submit Pre-Check-In
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

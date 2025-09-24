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

  // verify state
  const [verifyState, setVerifyState] = useState("idle"); // idle | checking | ok | fail
  const [verifyMsg, setVerifyMsg] = useState("");

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

  // ✅ Resize + compress image before sending
  async function resizeImage(file, maxWidth = 1000, maxHeight = 1000) {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onerror = reject;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        resolve(base64);
      };

      reader.readAsDataURL(file);
    });
  }

  // ✅ Verify licence
  const verifyLicence = async () => {
    if (!file) {
      setVerifyMsg("Please choose a licence photo first.");
      return;
    }
    setVerifyState("checking");
    setVerifyMsg("Verifying…");

    try {
      const imageBase64 = await resizeImage(file);

      const res = await fetch("/.netlify/functions/verify-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setVerifyState("ok");
        setVerifyMsg("✓ Licence verified");
      } else {
        setVerifyState("fail");
        setVerifyMsg(
          "AWS error: " + (data.error || "Could not verify. Please upload a clearer photo.")
        );
        setFile(null);
        const input = document.getElementById("lic-input");
        if (input) input.value = "";
      }
    } catch (e) {
      setVerifyState("fail");
      setVerifyMsg("Verification error: " + (e.message || "Unknown error"));
    }
  };

  // ✅ Submit only if licence verified
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (verifyState !== "ok") {
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

  const canSubmit = verifyState === "ok";

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
            <h2 style={{ textAlign: "center", color: "#000" }}>Pre-Check-In</h2>
            <p
              style={{
                textAlign: "center",
                marginBottom: "20px",
                color: "#000",
              }}
            >
              Please fill in the information below for the person dropping off the vehicle
            </p>

            <p>
              <strong>Booking:</strong> {booking.booking_name}
            </p>
            <p>
              <strong>Customer:</strong> {booking.firstname} {booking.surname}
            </p>
            <p>
              <strong>Date:</strong> {booking.schedule_date}
            </p>
            <p>
              <strong>Time:</strong> {booking.schedule_time}
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
              <label>First Name:</label>
              <input
                type="text"
                value={dropoffFirstname}
                onChange={(e) => setDropoffFirstname(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              <label>Last Name:</label>
              <input
                type="text"
                value={dropoffSurname}
                onChange={(e) => setDropoffSurname(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              <label>Cell Phone:</label>
              <input
                type="text"
                value={dropoffPhone}
                onChange={(e) => setDropoffPhone(e.target.value)}
                placeholder="e.g. 276XXXXXXXX"
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              <label>ID Number:</label>
              <input
                type="text"
                value={dropoffIdNumber}
                onChange={(e) => setDropoffIdNumber(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />

              <label>Upload Driver’s Licence (front):</label>
              <input
                id="lic-input"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                required
                style={{ display: "block", marginBottom: "10px" }}
              />

              <button
                type="button"
                onClick={verifyLicence}
                disabled={!file || verifyState === "checking"}
                style={{
                  padding: "8px 14px",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: !file || verifyState === "checking" ? "not-allowed" : "pointer",
                  marginBottom: "10px",
                }}
              >
                {verifyState === "checking" ? "Verifying…" : "Verify Licence"}
              </button>
              {verifyState === "ok" && (
                <p style={{ color: "green", fontWeight: "600" }}>{verifyMsg}</p>
              )}
              {verifyState === "fail" && (
                <p style={{ color: "crimson" }}>{verifyMsg}</p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: canSubmit ? "#007bff" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  marginTop: "15px",
                }}
              >
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

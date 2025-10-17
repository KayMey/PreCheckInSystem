import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PreCheckin() {
  const { id } = useParams();
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // confirm | update
  const [mode, setMode] = useState("confirm");

  // update fields
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");

  // file + verify
  const [file, setFile] = useState(null);
  const [verifyState, setVerifyState] = useState("idle"); // idle | checking | ok | fail
  const [verifyMsg, setVerifyMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/bookings/${id}`);
        setBooking(res.data);
        setFirstName(res.data.firstname || "");
        setSurname(res.data.surname || "");
        setPhone(res.data.cellphone || "");
        setIdNumber(""); // optional: OCR can fill later
      } catch (e) {
        console.error("Load booking failed:", e?.response?.data || e.message);
        setErrMsg("Invalid or expired link.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, BACKEND_URL]);

  // Return FULL data URL
  async function resizeImage(inFile, maxWidth = 1000, maxHeight = 1000) {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target.result);
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
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
        resolve(dataUrl); // keep header
      };
      reader.readAsDataURL(inFile);
    });
  }

  const verifyLicence = async () => {
    if (!file) {
      setVerifyMsg("Please choose a licence photo first.");
      return;
    }
    setVerifyState("checking");
    setVerifyMsg("Verifying…");
    try {
      const imageDataUrl = await resizeImage(file);
      const imageBase64 = imageDataUrl.split(",")[1];

      const res = await fetch("/.netlify/functions/verify-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, imageBase64 }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setVerifyState("ok");
        setVerifyMsg("✓ Licence verified");
        // if (data.idNumber) setIdNumber(data.idNumber);
      } else {
        setVerifyState("fail");
        setVerifyMsg(
          "AWS error: " +
            (data?.error || "Could not verify. Please upload a clearer photo.")
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg(null);

    if (verifyState !== "ok") {
      setErrMsg("Please verify the driver’s licence before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("action", mode === "confirm" ? "confirm" : "update");

    if (mode === "update") {
      formData.append("first_name", firstName);
      formData.append("surname", surname);
      formData.append("phone", phone);
      formData.append("id_number", idNumber);
    }
    if (file) formData.append("license", file);

    try {
      const res = await axios.put(
        `${BACKEND_URL}/bookings/${id}/precheckin`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("Pre-check-in success:", res.status, res.data);
      setSubmitted(true);
    } catch (err) {
      const apiErr =
        err?.response?.data?.error ||
        err?.message ||
        "Unknown server error";
      console.error("Pre-check-in error:", err?.response || err);
      setErrMsg(`Failed to complete pre-check-in: ${apiErr}`);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading booking...</p>;
  if (errMsg && !submitted)
    return <p style={{ color: "red", textAlign: "center" }}>{errMsg}</p>;

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
          color: "#000",
          padding: 30,
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: 520,
        }}
      >
        {!submitted ? (
          <>
            <h2 style={{ textAlign: "center", color: "#000" }}>Pre-Check-In</h2>
            <p style={{ textAlign: "center", marginBottom: 20, color: "#000" }}>
              Confirm or update the details of the person dropping off the vehicle.
            </p>

            <div
              style={{
                background: "#f6f6f6",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                color: "#000",
              }}
            >
              <div>
                <strong>Booking:</strong> {booking.booking_name}
              </div>
              <div>
                <strong>Customer:</strong> {booking.firstname} {booking.surname}
              </div>
              <div>
                <strong>Date:</strong> {booking.schedule_date}
              </div>
              <div>
                <strong>Time:</strong> {booking.schedule_time}
              </div>
            </div>

            <div style={{ marginBottom: 12, color: "#000" }}>
              <label>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "confirm"}
                  onChange={() => setMode("confirm")}
                />{" "}
                Use booking details
              </label>
              <label style={{ marginLeft: 16 }}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "update"}
                  onChange={() => setMode("update")}
                />{" "}
                Update details
              </label>
            </div>

            {mode === "update" && (
              <div style={{ marginBottom: 12, color: "#000" }}>
                <label>First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{ width: "100%", padding: 8, marginBottom: 8 }}
                />
                <label>Surname</label>
                <input
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                  style={{ width: "100%", padding: 8, marginBottom: 8 }}
                />
                <label>Cell Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 276XXXXXXXX"
                  required
                  style={{ width: "100%", padding: 8, marginBottom: 8 }}
                />
                <label>ID Number</label>
                <input
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                  style={{ width: "100%", padding: 8, marginBottom: 8 }}
                />
              </div>
            )}

            <div style={{ marginBottom: 10, color: "#000" }}>
              <label>Upload Driver’s Licence (front)</label>
              <input
                id="lic-input"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                style={{ display: "block", marginTop: 6 }}
              />
              <button
                type="button"
                onClick={verifyLicence}
                disabled={!file || verifyState === "checking"}
                style={{
                  marginTop: 10,
                  padding: "8px 14px",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                }}
              >
                {verifyState === "checking" ? "Verifying…" : "Verify Licence"}
              </button>
              {verifyState === "ok" && (
                <p style={{ color: "green", fontWeight: 600 }}>{verifyMsg}</p>
              )}
              {verifyState === "fail" && (
                <p style={{ color: "crimson" }}>{verifyMsg}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: "100%",
                padding: 10,
                background: canSubmit ? "#007bff" : "#ccc",
                color: "#fff",
                border: "none",
                borderRadius: 5,
              }}
            >
              Submit Pre-Check-In
            </button>

            {errMsg && (
              <p style={{ color: "red", marginTop: 12, textAlign: "center" }}>
                {errMsg}
              </p>
            )}
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

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

  // helper: convert file to base64
  async function fileToBase64(f) {
    const buf = await f.arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  // verify licence via Netlify function
  const verifyLicence = async () => {
    if (!file) {
      setVerifyMsg("Please choose a licence photo first.");
      return;
    }
    setVerifyState("checking");
    setVerifyMsg("Verifying…");

    try {
      const imageBase64 = await fileToBase64(file);
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
        setVerifyMsg("Could not verify. Please upload a clearer photo of the licence.");
        setFile(null);
        const input = document.getElementById("lic-input");
        if (input) input.value = "";
      }
    } catch (e) {
      setVerifyState("fail");
      setVerifyMsg("Verification error. Please try again.");
    }
  };

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (verifyState !== "ok") {
      setError("Please verify the licence before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("dropoff_firstname", dropoffFirstname);
      formData.append("dropoff_surname", dropoffSurname);
      formData.append("dropoff_phone", dropoffPhone);
      formData.append("dropoff_id_number", dropoffIdNumber);
      formData.append("file", file);

      await axios.post(`${BACKEND_URL}/precheckin/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
    } catch (err) {
      setError("Error submitting pre-check-in. Please try again.");
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (submitted) return <p>✅ Pre-check-in complete! Thank you.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold mb-2">Pre-Check-In for {booking?.booking_name}</h2>

      <div>
        <label>First Name</label>
        <input
          type="text"
          value={dropoffFirstname}
          onChange={(e) => setDropoffFirstname(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Surname</label>
        <input
          type="text"
          value={dropoffSurname}
          onChange={(e) => setDropoffSurname(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Phone</label>
        <input
          type="tel"
          value={dropoffPhone}
          onChange={(e) => setDropoffPhone(e.target.value)}
          required
        />
      </div>

      <div>
        <label>ID Number</label>
        <input
          type="text"
          value={dropoffIdNumber}
          onChange={(e) => setDropoffIdNumber(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Driver’s Licence (front)</label>
        <input
          id="lic-input"
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setVerifyState("idle");
            setVerifyMsg("");
          }}
        />

        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={verifyLicence}
            disabled={!file || verifyState === "checking"}
          >
            {verifyState === "checking" ? "Verifying…" : "Verify Licence"}
          </button>

          {verifyState === "ok" && (
            <span style={{ color: "green", fontWeight: 600 }}>Verified</span>
          )}
          {verifyState === "fail" && (
            <span style={{ color: "crimson" }}>{verifyMsg}</span>
          )}
        </div>
      </div>

      <button type="submit" disabled={verifyState !== "ok"}>
        Submit Pre-Check-In
      </button>
    </form>
  );
}

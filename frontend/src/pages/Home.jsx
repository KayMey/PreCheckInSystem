import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

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
          textAlign: "center",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <h1 style={{ marginBottom: "10px" }}>Pre-Check-In Demo System</h1>
        <p style={{ marginBottom: "20px" }}>
          Welcome! Please choose an option below
        </p>

        <button
          onClick={() => navigate("/employee/create")}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Create Booking
        </button>

        <button
          onClick={() => navigate("/employee/view")}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          View Bookings
        </button>
      </div>
    </div>
  );
}

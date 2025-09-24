import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8f9fa",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "10px", fontSize: "28px", color: "#333" }}>
        Pre-Check-In Demo System
      </h1>
      <p style={{ marginBottom: "30px", fontSize: "16px", color: "#555" }}>
        Welcome! Please choose an option below
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Link
          to="/employee/create"
          style={{
            padding: "12px 24px",
            background: "#007bff",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Create Booking
        </Link>
        <Link
          to="/employee/view"
          style={{
            padding: "12px 24px",
            background: "#28a745",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          View Bookings
        </Link>
      </div>
    </div>
  );
}

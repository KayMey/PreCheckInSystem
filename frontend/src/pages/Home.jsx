import { Link } from "react-router-dom";

export default function HomePage() {
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
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "600px",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Pre-Check-In Demo System</h1>
        <p style={{ marginBottom: "30px", fontSize: "16px", color: "#555" }}>
          Welcome! Please choose an option below
        </p>

        <Link to="/employee/create">
          <button
            style={{
              width: "100%",
              padding: "12px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            Create Booking
          </button>
        </Link>

        <Link to="/employee/view">
          <button
            style={{
              width: "100%",
              padding: "12px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            View Bookings
          </button>
        </Link>
      </div>
    </div>
  );
}

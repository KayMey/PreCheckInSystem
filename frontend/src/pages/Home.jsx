import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8f9fa",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Welcome</h1>
        <p style={{ marginBottom: "30px" }}>
          Please choose an option below
        </p>
        <Link
          to="/employee/create"
          style={{
            display: "block",
            marginBottom: "15px",
            padding: "12px",
            background: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Create Booking
        </Link>
        <Link
          to="/employee/view"
          style={{
            display: "block",
            padding: "12px",
            background: "green",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          View Bookings
        </Link>
      </div>
    </div>
  );
}

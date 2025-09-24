import { Link } from "react-router-dom";
import Layout from "../Layout";

export default function Home() {
  return (
    <Layout title="Pre-Check-In Demo System">
      <p style={{ marginBottom: "20px" }}>Welcome! Please choose an option below</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%", maxWidth: "300px" }}>
        <Link to="/employee/create">
          <button
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
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
              fontSize: "16px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            View Bookings
          </button>
        </Link>
      </div>
    </Layout>
  );
}
